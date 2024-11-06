import { useMMKVString } from "react-native-mmkv";
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
  PufferpanelServer
} from "./models";
import { storage } from "./storage";

export default class Panel {
  public readonly serverUrl: string;
  public readonly clientId: string;
  public readonly clientSecret: string;
  public readonly api: string;
  private cachedToken? = storage.getString("cachedToken");

  constructor({ serverUrl, clientId, clientSecret }: PanelParams) {
    this.serverUrl = serverUrl;
    this.clientId = clientId;
    this.clientSecret = clientSecret;

    this.api = this.serverUrl + "/api";
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
      })

      if (!res.ok) {
        throw await res.text();
      }

      return res.json().then((json: AuthPacket) => {
        storage.set("cachedToken", json.access_token);
        return json;
      });
    } catch (err) {
      console.warn("An unexpected error occured:", err);
      throw err;
    }
  }

  private async authorize(): Promise<string> {
    return this.cachedToken || await this.getAuth().then(packet => packet.access_token);
  }

  private async defaultHeaders(): Promise<{ Accept: string, Authorization: string }> {
    return {
      Accept: "application/json",
      Authorization: `Bearer ${await this.authorize()}`
    }
  }

  public readonly get = {
    nodes: async (): Promise<ModelsNodeView[]> => {
      try {
        const res = await fetch(`${this.api}/nodes`, {
          headers: await this.defaultHeaders(),
        });

        if (!res.ok) {
          throw await res.text();
        }

        return await res.json() as ModelsNodeView[];
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

        if (!res.ok) {
          throw await res.text();
        }

        return await res.json() as ModelsNodeView;
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

        if (!res.ok) {
          throw await res.text();
        }

        return await res.json() as ModelsDeployment;
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

        if (!res.ok) {
          throw await res.text();
        }

        return await res.json() as ModelsUserView;
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

        if (!res.ok) {
          throw await res.text();
        }

        return await res.json() as ModelsClient[];
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

        if (!res.ok) {
          throw await res.text();
        }

        return await res.json() as ModelsServerSearchResponse;
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

        if (!res.ok) {
          throw await res.text();
        }

        return await res.json() as ModelsGetServerResponse;
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

        if (!res.ok) {
          throw await res.text();
        }

        return await res.json() as ModelsClient[];
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

        if (!res.ok) {
          throw await res.text();
        }

        return await res.json() as ModelsPermissionView[];
      } catch (err) {
        console.warn("An unexpected error occured:", err);
        throw err;
      }
    },

    setting: async (key: string): Promise<ModelsChangeUserSetting> => {
      try {
        const res = await fetch(`${this.api}/settings${key}`, {
          headers: await this.defaultHeaders()
        });

        if (!res.ok) {
          throw await res.text();
        }

        return await res.json() as ModelsChangeUserSetting;
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

        if (!res.ok) {
          throw await res.text();
        }

        return await res.json() as ModelsTemplate;
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

        if (!res.ok) {
          throw await res.text();
        }

        return await res.json() as ModelsUserSettingView[];
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

        if (!res.ok) {
          throw await res.text();
        }

        return await res.json() as ModelsUserSearchResponse;
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

        if (!res.ok) {
          throw await res.text();
        }

        return await res.json() as ModelsUserView;
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

        if (!res.ok) {
          throw await res.text();
        }

        return await res.json() as ModelsPermissionView;
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

        if (!res.ok) {
          throw await res.text();
        }

        return await res.json() as ModelsNodeView;
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

        if (!res.ok) {
          throw await res.text();
        }

        return await res.json() as ModelsCreatedClient;
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
