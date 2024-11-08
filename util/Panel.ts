import {
  ModelServerStatusResponse,
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
  PufferpanelServer
} from "./models";
import { storage } from "./storage";

export default class Panel {
  private readonly serverUrl: string;
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly api: string;

  private static cachedToken = storage.getString("cachedToken");
  private static setCachedToken = (token: string) => {
    storage.set("cachedToken", token);
    Panel.cachedToken = storage.getString("cachedToken");
  }

  constructor({ serverUrl, clientId, clientSecret }: PanelParams) {
    this.serverUrl = serverUrl;
    this.clientId = clientId;
    this.clientSecret = clientSecret;

    this.api = this.serverUrl + "/api";
  }

  public static async getToken({ serverUrl, clientId, clientSecret }: PanelParams): Promise<string> {
    try {
      const res = await fetch(`${serverUrl}/oauth2/token`, {
        method: MethodOpts.post,
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: `grant_type=client_credentials&client_id=${clientId}&client_secret=${clientSecret}`
      });

      if (!res.ok) {
        throw await res.text().catch(() => "failed");
      }

      return await res.json().then((packet: AuthPacket) => packet.access_token);
    } catch (err) {
      throw "An unexpected error occured:" + err;
    }
  }

  public async getAuth(): Promise<AuthPacket> {
    try {
      const res = await fetch(`${this.serverUrl}/oauth2/token`, {
        method: MethodOpts.post,
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: `grant_type=client_credentials&client_id=${this.clientId}&client_secret=${this.clientSecret}` 
      });

      if (!res.ok) {
        throw await res.text().catch(() => "failed");
      }

      return res.json().then((json: AuthPacket) => {
        Panel.setCachedToken(json.access_token);
        return json;
      });
    } catch (err) {
      console.warn("An unexpected error occured:", err);
      throw err;
    }
  }

  private async authorize(): Promise<string> {
    return Panel.cachedToken || await this.getAuth().then(packet => packet.access_token);
  }

  private async defaultHeaders(): Promise<{ Accept: string, Authorization: string }> {
    return {
      Accept: "application/json",
      Authorization: `Bearer ${await this.authorize()}`
    }
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
          headers: await this.defaultHeaders(),
        });

        return await this.handleResponse(res, this.get.nodes) as ModelsNodeView[];
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

        return await this.handleResponse(res, this.get.node, id) as ModelsNodeView;
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

        return await this.handleResponse(res, this.get.nodeDeployment, id) as ModelsDeployment;
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

        return await this.handleResponse(res, this.get.self) as ModelsUserView;
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

        return await this.handleResponse(res, this.get.selfOauth2) as ModelsClient[];
      } catch (err) {
        console.warn("An unexpected error occured:", err);
        throw err;
      }
    },

    // TODO: Implement optional search parameters
    servers: async (/*{ username, node, name, limit, page }: ServerSearchParams*/): Promise<ModelsServerSearchResponse> => {
      try {
        const res = await fetch(`${this.api}/servers`, {
          headers: await this.defaultHeaders()
        });

        const data = await this.handleResponse(res, this.get.servers) as ModelsServerSearchResponse;

        for (const server of data.servers) {
          server.running = await this.get.serverStatus(server.id).then(r => r.running);
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

        return await this.handleResponse(res, this.get.server, id) as ModelsGetServerResponse;
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

        return await this.handleResponse(res, this.get.serverOauth2, id) as ModelsClient[];
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

        return await this.handleResponse(res, this.get.serverUsers, id) as ModelsPermissionView[];
      } catch (err) {
        console.warn("An unexpected error occured:", err);
        throw err;
      }
    },

    serverStatus: async (id: string): Promise<ModelServerStatusResponse> => {
      try {
        const res = await fetch(`${this.serverUrl}/proxy/daemon/server/${id}/status`, {
          headers: await this.defaultHeaders()
        });

        return await this.handleResponse(res, this.get.serverStatus, id) as ModelServerStatusResponse;
      } catch (err) {
        throw err;
      }
    },

    setting: async (key: string): Promise<ModelsChangeUserSetting> => {
      try {
        const res = await fetch(`${this.api}/settings${key}`, {
          headers: await this.defaultHeaders()
        });

        return await this.handleResponse(res, this.get.setting, key) as ModelsChangeUserSetting;
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

        return await this.handleResponse(res, this.get.templates) as ModelsTemplate;
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

        return await this.handleResponse(res, this.get.settings) as ModelsUserSettingView[];
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

        return await this.handleResponse(res, this.get.users) as ModelsUserSearchResponse;
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

        return await this.handleResponse(res, this.get.user, id) as ModelsUserView;
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

        return await this.handleResponse(res, this.get.userPerms, id) as ModelsPermissionView;
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

        return await this.handleResponse(res, this.create.node) as ModelsNodeView;
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

        return await this.handleResponse(res, this.create.oauth2) as ModelsCreatedClient;
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
  clientId: string;
  clientSecret: string;
}

export interface AuthError {
  error: string;
}

export interface AuthPacket {
  access_token: string;
  expires_in: number;
  scope: "oauth2.auth";
  token_type: "Bearer";
}

export enum MethodOpts {
  get = "GET",
  post = "POST"
}
