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
  PufferpanelServerRunning,
  PanelSettingResponse,
  ConfigResponse,
  ServerDataResponse,
  PufferpanelServerStats,
  MessagesFileDesc,
  PufferpanelError,
  PufferpanelDaemonRunning
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

  private static cachedScopes: AuthScope[] = storage.getString("cachedScopes")
    ? JSON.parse(storage.getString("cachedScopes")!)
    : [];

  public static getCachedScopes = (): AuthScope[] => this.cachedScopes;

  public static setCachedScopes = (scopes: AuthScope[]) => {
    storage.set("cachedScopes", JSON.stringify(scopes));
    Panel.cachedScopes = scopes;
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
          Accept: "application/json",
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
          Accept: "application/json",
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
        Panel.setCachedScopes(json.scopes || []);
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
    Accept: string;
    Authorization: string;
    "User-Agent": "puffMob/0.0.1";
  }> {
    return {
      Accept: "application/json",
      Authorization: `Bearer ${await this.authorize()}`,
      "User-Agent": "puffMob/0.0.1"
    };
  }

  private async handleResponse(
    res: Response,
    req: Function, // TODO: Definitely find a better way to type this
    ...args: string[] // :skull:
  ): Promise<unknown> {
    if (res.status === 400 || res.status === 500) {
      throw await res.json() as PufferpanelError;
    }

    if (res.status === 401) {
      try {
        this.getAuth();
        return await req(...args);
      } catch {
        throw `Unable to reauthenticate with the server: ${await res.text().catch(() => "failed")}`;
      }
    }

    if (res.status === 404) {
      throw "Resource wasn't found.";
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

            server.actions = {
              execute: async (command: string): Promise<void> => await this.actions.execute(server.id, command),
              kill: async (): Promise<void> => await this.actions.kill(server.id),
              start: async (): Promise<void> => await this.actions.start(server.id),
              stop: async (): Promise<void> => await this.actions.stop(server.id),
              extract: async (filename: string): Promise<void> => await this.get.extract(server.id, filename)
            };

            server.edit = {
              name: async (newName: string): Promise<void> => await this.edit.serverName(server.id, newName)
            };

            server.get = {
              // TODO: Until I find a way to use the color codes, they will be killed
              // https://stackoverflow.com/questions/7149601/how-to-remove-replace-ansi-color-codes-from-a-string-in-javascript
              console: async (): Promise<string> => await this.get.console(server.id).then(({ logs }) => logs.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, "")),

              data: async (): Promise<ServerDataResponse> => await this.get.data(server.id),
              file: async (filename?: string): Promise<MessagesFileDesc[]> => await this.get.file(server.id, filename),
              stats: async (): Promise<PufferpanelServerStats> => await this.get.stats(server.id)
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
        // Perms is a constant parameter because without it `permissions` is null
        const res = await fetch(`${this.api}/servers/${id}?perms`, {
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

        data.server.actions = {
          execute: async (command: string): Promise<void> => await this.actions.execute(data.server.id, command),
          kill: async (): Promise<void> => await this.actions.kill(data.server.id),
          start: async (): Promise<void> => await this.actions.start(data.server.id),
          stop: async (): Promise<void> => await this.actions.stop(data.server.id),
          extract: async (filename: string): Promise<void> => await this.get.extract(data.server.id, filename)
        };

        data.server.get = {
          // TODO: Until I find a way to use the color codes, they will be killed
          // https://stackoverflow.com/questions/7149601/how-to-remove-replace-ansi-color-codes-from-a-string-in-javascript
          console: async (): Promise<string> => await this.get.console(data.server.id).then(({ logs }) => logs.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, "")),

          data: async (): Promise<ServerDataResponse> => await this.get.data(data.server.id),
          file: async (filename?: string): Promise<MessagesFileDesc[]> => await this.get.file(data.server.id, filename),
          stats: async (): Promise<PufferpanelServerStats> => await this.get.stats(data.server.id),
        };

        data.server.edit = {
          name: async (newName: string): Promise<void> => await this.edit.serverName(data.server.id, newName)
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
        const res = await fetch(`${this.daemon}/server/${id}/status`, {
          headers: await this.defaultHeaders()
        });

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

    panelSetting: async (
      setting: PanelSetting
    ): Promise<PanelSettingResponse> => {
      const res = await fetch(`${this.api}/settings/${setting}`, {
        headers: await this.defaultHeaders()
      });

      return (await this.handleResponse(
        res,
        this.get.panelSetting,
        setting
      )) as PanelSettingResponse;
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
    },

    daemon: async (): Promise<PufferpanelDaemonRunning> => {
      const res = await fetch(this.daemon, {
        headers: await this.defaultHeaders()
      });

      return await this.handleResponse(res, this.get.daemon) as PufferpanelDaemonRunning;
    },

    config: async (): Promise<ConfigResponse> => {
      try {
        const res = await fetch(`${this.api}/config`, {
          headers: await this.defaultHeaders()
        });

        return (await this.handleResponse(
          res,
          this.get.config
        )) as ConfigResponse;
      } catch (err) {
        console.warn("An unexpected error occured:", err);
        throw err;
      }
    },

    console: async (serverId: string): Promise<PufferpanelServerLogs> => {
      const res = await fetch(`${this.daemon}/server/${serverId}/console`, {
        headers: await this.defaultHeaders()
      });

      return await this.handleResponse(res, this.get.console, serverId) as PufferpanelServerLogs;
    },

    data: async (serverId: string): Promise<ServerDataResponse> => {
      const res = await fetch(`${this.daemon}/server/${serverId}/data`, {
        headers: await this.defaultHeaders()
      });

      return await this.handleResponse(res, this.get.data, serverId) as ServerDataResponse;
    },

    extract: async (serverId: string, filename: string): Promise<void> => {
      await fetch(`${this.daemon}/server/${serverId}/extract/${filename}`, {
        headers: await this.defaultHeaders()
      });
    },

    file: async (serverId: string, filename = ""): Promise<MessagesFileDesc[]> => {
      const res = await fetch(`${this.daemon}/server/${serverId}/file/${filename}`, {
        headers: await this.defaultHeaders()
      });

      return await this.handleResponse(res, this.get.file, serverId, filename) as MessagesFileDesc[];
    },

    stats: async (serverId: string): Promise<PufferpanelServerStats> => {
      const res = await fetch(`${this.daemon}/server/${serverId}/stats`, {
        headers: await this.defaultHeaders()
      });

      return await this.handleResponse(res, this.get.stats, serverId) as PufferpanelServerStats;
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

  public readonly edit = {
    serverName: async (serverId: string, newName: string): Promise<void> => {
      await fetch(`${this.api}/servers/${serverId}/name/${encodeURIComponent(newName)}`, {
        method: MethodOpts.put,
        headers: await this.defaultHeaders()
      });
    },

    user: async (params: UpdateUserParams): Promise<void> => {
      const res = await fetch(`${this.api}/self`, {
        method: MethodOpts.put,
        headers: await this.defaultHeaders(),
        body: JSON.stringify(params)
      });

      if (!res.ok) {
        throw "Credentials invalid";
      }
    },

    settings: async (params: UpdateServerParams): Promise<void> => {
      const res = await fetch(`${this.api}/settings`, {
        method: MethodOpts.post,
        headers: await this.defaultHeaders(),
        body: JSON.stringify(params)
      })

      if (!res.ok) {
        throw "Invalid server response";
      }
    }
  };

  public readonly actions = {
    execute: async (serverId: string, command: string): Promise<void> => {
      await fetch(`${this.daemon}/server/${serverId}/console`, {
        headers: await this.defaultHeaders(),
        body: command
      });
    },

    kill: async (serverId: string): Promise<void> => {
      await fetch(`${this.daemon}/server/${serverId}/kill`, {
        method: MethodOpts.post,
        headers: await this.defaultHeaders()
      });
    },

    start: async (serverId: string): Promise<void> => {
      await fetch(`${this.daemon}/server/${serverId}/start`, {
        method: MethodOpts.post,
        headers: await this.defaultHeaders()
      });
    },

    stop: async (serverId: string): Promise<void> => {
      await fetch(`${this.daemon}/server/${serverId}/stop`, {
        method: MethodOpts.post,
        headers: await this.defaultHeaders()
      });
    }
  }

  public getSocket(id: string): WebSocket {
    const protocol = this.serverUrl.startsWith("https://") ? "wss://" : "ws://";
    const address = this.daemon.replace("https://", "").replace("http://", "");

    // Sending Authorization through the websocket is possible, but tsc won't like it
    // https://stackoverflow.com/a/69366089
    // @ts-ignore
    const socket = new WebSocket(`${protocol}${address}/socket/${id}`, null, {
      headers: {
        ["Authorization"]: `Bearer ${Panel.cachedToken}`
      }
    });

    socket.onopen = () => {
      console.log("Connected to server websocket");
      socket.send(JSON.stringify({ type: "status" }));
      socket.send(JSON.stringify({ type: "replay", since: 0 }));

      const interval = setInterval(() => {
        socket.send(JSON.stringify({ type: "status" }));
        console.log("Sent keepalive");
      }, 45_000);

      socket.onclose = m => {
        clearInterval(interval);
        console.log("Killed keepalive");
        console.log("socket closed:", m.code, m.reason);
      };
    };

    return socket;
  }
}

export interface UpdateUserParams {
  password: string;
  email?: string;
  username?: string;
}

// Quotes because uhhh dot notation
export interface UpdateServerParams {
  "panel.registrationEnabled": boolean;
  "panel.settings.companyName": string;
  "panel.settings.defaultTheme": string;
  "panel.settings.masterUrl": string;
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

export type PanelSetting =
  | "panel.settings.masterUrl"
  | "panel.settings.companyName"
  | "panel.settings.defaultTheme"
  | "panel.registrationEnabled"
  | "panel.email.provider"
  | "panel.email.from"
  | "panel.email.domain"
  | "panel.email.key"
  | "panel.email.host"
  | "panel.email.username"
  | "panel.email.password";

export interface AuthPacket {
  session: string;
  scopes?: AuthScope[];
}

export enum MethodOpts {
  get = "GET",
  post = "POST",
  put = "PUT",
  delete = "DELETE"
}
