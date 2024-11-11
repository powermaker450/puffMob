import {
  ModelsChangeUserSetting,
  ModelsClient,
  ModelsCreatedClient,
  ModelsDeployment,
  ModelsGetServerResponse,
  ModelsNodeView,
  ModelsPermissionView,
  ModelsServerSearchResponse,
  ModelsTemplate,
  ModelsUserSearchResponse,
  ModelsUserSettingView,
  ModelsUserView,
  PufferpanelServer,
  PufferpanelServerLogs,
  PufferpanelServerRunning
} from "./models";
import { storage } from "./storage";

export default class Panel {
  private readonly serverUrl: string;
  private readonly email: string;
  private readonly password: string;

  private readonly api: string;
  private readonly daemon: string;

  private static cachedToken = storage.getString("cachedToken");
  private static setCachedToken = (token: string) => {
    storage.set("cachedToken", token);
    Panel.cachedToken = storage.getString("cachedToken");
  };

  constructor({ serverUrl, email, password }: PanelParams) {
    this.serverUrl = serverUrl;
    this.email = email;
    this.password = password;

    this.api = this.serverUrl + "/api";
    this.daemon = this.serverUrl + "/proxy/daemon";
  }

  public static async getToken({
    serverUrl,
    email,
    password
  }: PanelParams): Promise<string> {
    try {
      const res = await fetch(`${serverUrl}/auth/login`, {
        method: MethodOpts.post,
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "User-Agent": "puffMob/0.0.1"
        },
        body: JSON.stringify({ email, password })
      });

      if (!res.ok) {
        throw await res.text().catch(() => "failed");
      }

      return await res.json().then((packet: AuthPacket) => packet.session);
    } catch (err) {
      throw "An unexpected error occured:" + err;
    }
  }

  public async getAuth(): Promise<AuthPacket> {
    try {
      const res = await fetch(`${this.serverUrl}/auth/login`, {
        method: MethodOpts.post,
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "User-Agent": "puffMob/0.0.1"
        },
        body: JSON.stringify({ email: this.email, password: this.password })
      });

      if (!res.ok) {
        throw await res.text().catch(() => "failed");
      }

      return res.json().then((json: AuthPacket) => {
        Panel.setCachedToken(json.session);
        return json;
      });
    } catch (err) {
      console.warn("An unexpected error occured:", err);
      throw err;
    }
  }

  public async getScopes(): Promise<AuthScope[]> {
    // It's possible for the user to have no scopes if the server admin is really mean
    return await this.getAuth().then(packet => packet.scopes || []);
  }

  private async authorize(): Promise<string> {
    return (
      Panel.cachedToken || (await this.getAuth().then(packet => packet.session))
    );
  }

  private async defaultHeaders(): Promise<{
    "Accept": string;
    "Authorization": string;
    "User-Agent": "puffMob/0.0.1"
  }> {
    return {
      "Accept": "application/json",
      "Authorization": `Bearer ${await this.authorize()}`,
      "User-Agent": "puffMob/0.0.1"
    };
  }

  private async handleResponse(
    res: Response,
    req: Function, // TODO: Definitely find a better way to type this
    ...args: string[] // :skull:
  ): Promise<unknown> {
    if (res.status === 401) {
      try {
        this.getAuth();
        return await req(...args);
      } catch {
        throw `Unable to reauthenticate with the server: ${await res.text().catch(() => "failed")}`;
      }
    }

    if (!res.ok) {
      throw await res.text().catch(() => "failed");
    }

    return await res.json();
  }

  public readonly get = {
    nodes: async (): Promise<ModelsNodeView[]> => {
      try {
        const res = await fetch(`${this.api}/nodes`, {
          headers: await this.defaultHeaders()
        });

        return (await this.handleResponse(
          res,
          this.get.nodes
        )) as ModelsNodeView[];
      } catch (err) {
        console.warn("An unexpected error occured", err);
        throw err;
      }
    },

    node: async (id: string): Promise<ModelsNodeView> => {
      try {
        const res = await fetch(`${this.api}/nodes/${id}`, {
          headers: await this.defaultHeaders()
        });

        return (await this.handleResponse(
          res,
          this.get.node,
          id
        )) as ModelsNodeView;
      } catch (err) {
        console.warn("An unexpected error occured:", err);
        throw err;
      }
    },

    nodeDeployment: async (id: string): Promise<ModelsDeployment> => {
      try {
        const res = await fetch(`${this.api}/nodes/${id}/deployment`, {
          headers: await this.defaultHeaders()
        });

        return (await this.handleResponse(
          res,
          this.get.nodeDeployment,
          id
        )) as ModelsDeployment;
      } catch (err) {
        console.warn("An unexpected error occured", err);
        throw err;
      }
    },

    self: async (): Promise<ModelsUserView> => {
      try {
        const res = await fetch(`${this.api}/self`, {
          headers: await this.defaultHeaders()
        });

        return (await this.handleResponse(
          res,
          this.get.self
        )) as ModelsUserView;
      } catch (err) {
        console.warn("An unexpected error occured:", err);
        throw err;
      }
    },

    selfOauth2: async (): Promise<ModelsClient[]> => {
      try {
        const res = await fetch(`${this.api}/self/oauth2`, {
          headers: await this.defaultHeaders()
        });

        return (await this.handleResponse(
          res,
          this.get.selfOauth2
        )) as ModelsClient[];
      } catch (err) {
        console.warn("An unexpected error occured:", err);
        throw err;
      }
    },

    // TODO: Implement optional search parameters
    servers:
      async (/*{ username, node, name, limit, page }: ServerSearchParams*/): Promise<ModelsServerSearchResponse> => {
        try {
          const res = await fetch(`${this.api}/servers`, {
            headers: await this.defaultHeaders()
          });

          const data = (await this.handleResponse(
            res,
            this.get.servers
          )) as ModelsServerSearchResponse;

          for (const server of data.servers) {
            server.running = await this.get
              .serverStatus(server.id)
              .then(({ running }) => running);

            server.actions.kill = async (): Promise<boolean> => {
              const res = await fetch(
                `${this.daemon}/server/${server.id}/kill`,
                {
                  method: MethodOpts.post,
                  headers: await this.defaultHeaders()
                }
              );

              return res.status === 204;
            };

            server.actions.start = async (): Promise<boolean> => {
              const res = await fetch(
                `${this.daemon}/server/${server.id}/start`,
                {
                  method: MethodOpts.post,
                  headers: await this.defaultHeaders()
                }
              );

              return res.status === 202 || res.status === 204;
            };

            server.actions.stop = async (): Promise<boolean> => {
              const res = await fetch(
                `${this.daemon}/server/${server.id}/start`,
                {
                  method: MethodOpts.post,
                  headers: await this.defaultHeaders()
                }
              );

              return res.status === 202 || res.status === 204;
            };

            server.get.console = async (): Promise<string> => {
              const res = await fetch(
                `${this.daemon}/server/${server.id}/console`,
                {
                  headers: await this.defaultHeaders()
                }
              );

              const serverLogs = await res
                .json()
                .then((json: PufferpanelServerLogs) => json.logs)
                .catch(() => "");

              // https://stackoverflow.com/questions/7149601/how-to-remove-replace-ansi-color-codes-from-a-string-in-javascript
              return serverLogs.replace(
                /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
                ""
              );
            };

            server.actions.execute = async (command: string): Promise<boolean> => {
              const res = await fetch(
                `${this.daemon}/server/${server.id}/console`,
                {
                  headers: await this.defaultHeaders(),
                  body: command
                }
              );

              return res.status === 204;
            };
          }

          return data;
        } catch (err) {
          console.warn("An unexpected error occured:", err);
          throw err;
        }
      },

    server: async (id: string): Promise<ModelsGetServerResponse> => {
      try {
        const res = await fetch(`${this.api}/servers/${id}`, {
          headers: await this.defaultHeaders()
        });

        const data = (await this.handleResponse(
          res,
          this.get.server,
          id
        )) as ModelsGetServerResponse;

        data.server.running = await this.get
          .serverStatus(id)
          .then(({ running }) => running);

        data.server.actions.kill = async (): Promise<boolean> => {
          const res = await fetch(
            `${this.daemon}/server/${data.server.id}/kill`,
            {
              method: MethodOpts.post,
              headers: await this.defaultHeaders()
            }
          );

          return res.status === 204;
        };

        data.server.actions.start = async (): Promise<boolean> => {
          const res = await fetch(
            `${this.daemon}/server/${data.server.id}/start`,
            {
              method: MethodOpts.post,
              headers: await this.defaultHeaders()
            }
          );

          return res.status === 202 || res.status === 204;
        };

        data.server.actions.stop = async (): Promise<boolean> => {
          const res = await fetch(
            `${this.daemon}/server/${data.server.id}/stop`,
            {
              method: MethodOpts.post,
              headers: await this.defaultHeaders()
            }
          );

          return res.status === 202 || res.status === 204;
        };

        data.server.get.console = async (): Promise<string> => {
          const res = await fetch(
            `${this.daemon}/server/${data.server.id}/console`,
            {
              headers: await this.defaultHeaders()
            }
          );

          const serverLogs = await res
            .json()
            .then((json: PufferpanelServerLogs) => json.logs)
            .catch(() => "");

        data

          // https://stackoverflow.com/questions/7149601/how-to-remove-replace-ansi-color-codes-from-a-string-in-javascript
          return serverLogs.replace(
            /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
            ""
          );
        };

        data.server.actions.execute = async (command: string): Promise<boolean> => {
          const res = await fetch(
            `${this.daemon}/server/${data.server.id}/console`,
            {
              method: MethodOpts.post,
              headers: await this.defaultHeaders(),
              body: command
            }
          );

          return res.status === 204;
        };

        return data;
      } catch (err) {
        console.warn("An unexpected error occured:", err);
        throw err;
      }
    },

    serverOauth2: async (id: string): Promise<ModelsClient[]> => {
      try {
        const res = await fetch(`${this.api}/servers/${id}/oauth2`, {
          headers: await this.defaultHeaders()
        });

        return (await this.handleResponse(
          res,
          this.get.serverOauth2,
          id
        )) as ModelsClient[];
      } catch (err) {
        console.warn("An unexpected error occured:", err);
        throw err;
      }
    },

    serverUsers: async (id: string): Promise<ModelsPermissionView[]> => {
      try {
        const res = await fetch(`${this.api}/servers/${id}/user`, {
          headers: await this.defaultHeaders()
        });

        return (await this.handleResponse(
          res,
          this.get.serverUsers,
          id
        )) as ModelsPermissionView[];
      } catch (err) {
        console.warn("An unexpected error occured:", err);
        throw err;
      }
    },

    serverStatus: async (id: string): Promise<PufferpanelServerRunning> => {
      try {
        const res = await fetch(
          `${this.daemon}/server/${id}/status`,
          {
            headers: await this.defaultHeaders()
          }
        );

        return (await this.handleResponse(
          res,
          this.get.serverStatus,
          id
        )) as PufferpanelServerRunning;
      } catch (err) {
        throw err;
      }
    },

    setting: async (key: string): Promise<ModelsChangeUserSetting> => {
      try {
        const res = await fetch(`${this.api}/settings${key}`, {
          headers: await this.defaultHeaders()
        });

        return (await this.handleResponse(
          res,
          this.get.setting,
          key
        )) as ModelsChangeUserSetting;
      } catch (err) {
        console.warn("An unexpected error occured:", err);
        throw err;
      }
    },

    templates: async (): Promise<ModelsTemplate> => {
      try {
        const res = await fetch(`${this.api}/templates`, {
          headers: await this.defaultHeaders()
        });

        return (await this.handleResponse(
          res,
          this.get.templates
        )) as ModelsTemplate;
      } catch (err) {
        console.warn("An unexpected error occured:", err);
        throw err;
      }
    },

    settings: async (): Promise<ModelsUserSettingView[]> => {
      try {
        const res = await fetch(`${this.api}/userSettings`, {
          headers: await this.defaultHeaders()
        });

        return (await this.handleResponse(
          res,
          this.get.settings
        )) as ModelsUserSettingView[];
      } catch (err) {
        console.warn("An unexpected error occured", err);
        throw err;
      }
    },

    // The documentation states that this endpoint must send a request body,
    // but you cannot send a request body in a GET request, so this is kind of broken? :P
    users: async (): Promise<ModelsUserSearchResponse> => {
      try {
        const res = await fetch(`${this.api}/users`, {
          headers: await this.defaultHeaders()
        });

        return (await this.handleResponse(
          res,
          this.get.users
        )) as ModelsUserSearchResponse;
      } catch (err) {
        console.warn("An unexpected error occured", err);
        throw err;
      }
    },

    user: async (id: string): Promise<ModelsUserView> => {
      try {
        const res = await fetch(`${this.api}/users/${id}`, {
          headers: await this.defaultHeaders()
        });

        return (await this.handleResponse(
          res,
          this.get.user,
          id
        )) as ModelsUserView;
      } catch (err) {
        console.warn("An unexpected error occured", err);
        throw err;
      }
    },

    userPerms: async (id: string): Promise<ModelsPermissionView> => {
      try {
        const res = await fetch(`${this.api}/users/${id}/perms`, {
          headers: await this.defaultHeaders()
        });

        return (await this.handleResponse(
          res,
          this.get.userPerms,
          id
        )) as ModelsPermissionView;
      } catch (err) {
        console.warn("An unexpected error occured:", err);
        throw err;
      }
    }
  };

  public readonly create = {
    node: async (): Promise<ModelsNodeView> => {
      try {
        const res = await fetch(`${this.api}/nodes`, {
          method: MethodOpts.post,
          headers: await this.defaultHeaders()
        });

        return (await this.handleResponse(
          res,
          this.create.node
        )) as ModelsNodeView;
      } catch (err) {
        console.warn("An unexpected error occured", err);
        throw err;
      }
    },

    oauth2: async (): Promise<ModelsCreatedClient> => {
      try {
        const res = await fetch(`${this.api}/self/oauth2`, {
          method: MethodOpts.post,
          headers: await this.defaultHeaders()
        });

        return (await this.handleResponse(
          res,
          this.create.oauth2
        )) as ModelsCreatedClient;
      } catch (err) {
        console.warn("An unexpected error occured", err);
        throw err;
      }
    },

    server: async (): Promise<PufferpanelServer> => {
      throw new Error("Not implemented");

      // try {
      //   const res = await fetch(`${this.api}/servers`)
      // } catch (err) {
      //   console.warn("An unexpected error occured", err);
      //   throw err;
      // }
    }
  };

  public getSocket(id: string) {
    const protocol = this.serverUrl.startsWith("https://") ? "wss://" : "ws://";
    const address = this.daemon.replace("https://", "").replace("http://", "");

    // Sending Authorization through the websocket is possible, but tsc won't like it
    // https://stackoverflow.com/a/69366089
    // @ts-ignore
    return new WebSocket(`${protocol}${address}/socket/${id}`, null, {
      headers: {
        ["Authorization"]: `Bearer ${Panel.cachedToken}`
      }
    });
  }
}

export interface ServerSearchParams {
  username?: string;
  node?: number;
  name?: string;
  limit?: number;
  page?: number;
}

export interface Ouauth2CreationParams {
  name: string;
  description: string;
}

export interface PanelParams {
  serverUrl: string;
  email: string;
  password: string;
}

export interface AuthError {
  error: string;
}

export type AuthScope =
  | "servers.admin"
  | "servers.create"
  | "nodes.view"
  | "nodes.deploy"
  | "nodes.edit"
  | "templates.view"
  | "users.view"
  | "users.edit"
  | "panel.settings"
  | "servers.view";

export interface AuthPacket {
  session: string;
  scopes?: AuthScope[];
}

export enum MethodOpts {
  get = "GET",
  post = "POST"
}
