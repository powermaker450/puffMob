/*
 * puffMob: A mobile client for Pufferpanel
 * Copyright (C) 2024 powermaker450
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import PufferpanelSocket from "./PufferpanelSocket";
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

/**
 * A class that wraps most if not all callable methods for Pufferpanel.
 */
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

  private static getSettings = (): PanelParams => storage.getString("settings")
    ? JSON.parse(storage.getString("settings")!)
    : { serverUrl: "", email: "", password: "" };

  /**
   * Preconfigures a panel object with the currently stored user settings.
   *
   * @returns A panel object preconfigured with the stored user settings.
   */
  public static getPanel = (): Panel => new Panel(Panel.getSettings()); 
 
  /**
   * Gets the currently cached scopes. Keep in mind the only time this cache is automatically refreshed is when the app is reopened.
   *
   * @returns An array of scopes.
   */
  public static getCachedScopes = (): AuthScope[] => this.cachedScopes;

  /**
   * Updates the scope cache.
   *
   * @param scopes - An array of scopes
   */
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

  /**
   * Requests a new session token from the server.
   *
   * @returns A session token
   */
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

  /**
   * Requests a new authentication packet from the server.
   *
   * @returns An auth packet containing user scopes and a session token.
   */
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

  /**
   * Requests the user scopes from the server.
   *
   * @returns An array of user scopes
   */
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
      throw (await res.json()) as PufferpanelError;
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

  /**
   * Houses authentication-protected methods that obtain data from the server.
   */
  public readonly get = {
    /**
     * Request an array of nodes from the server.
     *
     * @returns An array of nodes
     */
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

    /**
     * Request the data of a single node from the server.
     *
     * @param id - The node ID to request
     * @return The requested node associated with the node ID
     */
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

    /**
     * Sends a request for data about the current user.
     *
     * @returns The email, ID, and username of the current user.
     */
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

    /**
     * Get the OAUTH2 clients of the current user.
     *
     * @returns An array of OAUTH2 clients, with id, name and description
     */
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
    /**
     * Get the list of servers the current user is allowed to view.
     *
     * @returns An object with the paging value and an array of servers
     */
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
              execute: async (command: string): Promise<void> =>
                await this.actions.execute(server.id, command),
              kill: async (): Promise<void> =>
                await this.actions.kill(server.id),
              start: async (): Promise<void> =>
                await this.actions.start(server.id),
              stop: async (): Promise<void> =>
                await this.actions.stop(server.id),
              extract: async (filename: string): Promise<void> =>
                await this.get.extract(server.id, filename)
            };

            server.edit = {
              name: async (newName: string): Promise<void> =>
                await this.edit.serverName(server.id, newName)
            };

            server.get = {
              // TODO: Until I find a way to use the color codes, they will be killed
              // https://stackoverflow.com/questions/7149601/how-to-remove-replace-ansi-color-codes-from-a-string-in-javascript
              console: async (): Promise<string> =>
                await this.get
                  .console(server.id)
                  .then(({ logs }) =>
                    logs.replace(
                      /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
                      ""
                    )
                  ),

              data: async (): Promise<ServerDataResponse> =>
                await this.get.data(server.id),
              file: async (filename?: string): Promise<MessagesFileDesc[]> =>
                await this.get.file(server.id, filename),
              stats: async (): Promise<PufferpanelServerStats> =>
                await this.get.stats(server.id)
            };

            server.delete = {
              oauth2: async (clientId: string): Promise<void> => await this.delete.serverOauth2(server.id, clientId),
              user: async (userId: string): Promise<void> => await this.delete.serverUser(server.id, userId),
              file: async (filename: string): Promise<void> => await this.delete.file(server.id, filename)
            }
          }

          return data;
        } catch (err) {
          console.warn("An unexpected error occured:", err);
          throw err;
        }
      },

    /**
    * Gets a server given that the user has permissions to view it.
    *
    * @param id - The server ID to query
    * @return The server associated with the ID
    */
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
          execute: async (command: string): Promise<void> =>
            await this.actions.execute(data.server.id, command),
          kill: async (): Promise<void> =>
            await this.actions.kill(data.server.id),
          start: async (): Promise<void> =>
            await this.actions.start(data.server.id),
          stop: async (): Promise<void> =>
            await this.actions.stop(data.server.id),
          extract: async (filename: string): Promise<void> =>
            await this.get.extract(data.server.id, filename)
        };

        data.server.get = {
          // TODO: Until I find a way to use the color codes, they will be killed
          // https://stackoverflow.com/questions/7149601/how-to-remove-replace-ansi-color-codes-from-a-string-in-javascript
          console: async (): Promise<string> =>
            await this.get
              .console(data.server.id)
              .then(({ logs }) =>
                logs.replace(
                  /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
                  ""
                )
              ),

          data: async (): Promise<ServerDataResponse> =>
            await this.get.data(data.server.id),
          file: async (filename?: string): Promise<MessagesFileDesc[]> =>
            await this.get.file(data.server.id, filename),
          stats: async (): Promise<PufferpanelServerStats> =>
            await this.get.stats(data.server.id)
        };

        data.server.edit = {
          name: async (newName: string): Promise<void> =>
            await this.edit.serverName(data.server.id, newName)
        };

        data.server.delete = {
          oauth2: async (clientId: string): Promise<void> => await this.delete.serverOauth2(data.server.id, clientId),
          user: async (userId: string): Promise<void> => await this.delete.serverUser(data.server.id, userId),
          file: async (filename: string): Promise<void> => await this.delete.file(data.server.id, filename)
        }

        return data;
      } catch (err) {
        console.warn("An unexpected error occured:", err);
        throw err;
      }
    },

    /**
    * Gets the list of OAuth2 clients for a given server.
    *
    * @param id - The server ID to query
    * @return An array of OAuth2 clients
    */
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

    /**
    * Gets the users that have permissions on a given server.
    *
    * @param id - The server ID to query
    * @return An array of users and their permissions for this server
    */
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

    /**
    * Check if a server is running.
    * If you want to represent real-time server status, use a websocket instead.
    *
    * @param id - The server ID to query
    * @returns An object with `running` as boolean
    */
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

    /**
    * Gets the value of a user setting 
    *
    * @param key - The setting to check
    * @returns The value of the given setting
    */
    setting: async (key: string): Promise<ModelsChangeUserSetting> => {
      try {
        const res = await fetch(`${this.api}/settings/${key}`, {
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

    /**
    * Get all the templates the server offers.
    *
    * @returns An array of available templates
    */
    templates: async (): Promise<ModelsTemplate[]> => {
      try {
        const res = await fetch(`${this.api}/templates`, {
          headers: await this.defaultHeaders()
        });

        return (await this.handleResponse(
          res,
          this.get.templates
        )) as ModelsTemplate[];
      } catch (err) {
        console.warn("An unexpected error occured:", err);
        throw err;
      }
    },

    /**
    * Gets the settings of the current user.
    *
    * @returns An array of settings associated with the current user
    */
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

    /**
    * Gets a setting of the Pufferpanel Instance. Requires admin privledges.
    *
    * @param setting - The setting to query
    * @returns The value of the given setting
    */
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
    // users: async (): Promise<ModelsUserSearchResponse> => {
    //   try {
    //     const res = await fetch(`${this.api}/users`, {
    //       headers: await this.defaultHeaders()
    //     });
    //
    //     return (await this.handleResponse(
    //       res,
    //       this.get.users
    //     )) as ModelsUserSearchResponse;
    //   } catch (err) {
    //     console.warn("An unexpected error occured", err);
    //     throw err;
    //   }
    // },

    /**
    * Gets the details of a given user. Requires admin privledges.
    *
    * @id - The user ID to query
    * @returns Details associated with the given user ID
    */
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

    /**
    * Gets the global permissions of a given user. Requires admin privledges.
    *
    * @param id - The user ID to query
    * @returns An object containing the permissions the given user has
    */
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

    /**
    * Check if the daemon is running.
    *
    * @returns An object, where `running` is boolean
    */
    daemon: async (): Promise<PufferpanelDaemonRunning> => {
      const res = await fetch(this.daemon, {
        headers: await this.defaultHeaders()
      });

      return (await this.handleResponse(
        res,
        this.get.daemon
      )) as PufferpanelDaemonRunning;
    },

    /**
    * Gets the settings of the Pufferpanel Instance set by the server admin, like instance name, theme, etc.
    *
    * @returns An object containing the settings of the Pufferpanel Instance
    */
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

    /**
    * Gets the logs of a given server.
    *
    * @param serverId - The server ID to query
    * @returns An object containing how far back the log data goes and the logs themselves
    */
    console: async (serverId: string): Promise<PufferpanelServerLogs> => {
      const res = await fetch(`${this.daemon}/server/${serverId}/console`, {
        headers: await this.defaultHeaders()
      });

      return (await this.handleResponse(
        res,
        this.get.console,
        serverId
      )) as PufferpanelServerLogs;
    },

    /**
    * Gets the config data of a given server.
    *
    * @param serverId - The server to query
    * @returns An object containing `data`, which contains the config variables for the given server.
    */
    data: async (serverId: string): Promise<ServerDataResponse> => {
      const res = await fetch(`${this.daemon}/server/${serverId}/data`, {
        headers: await this.defaultHeaders()
      });

      return (await this.handleResponse(
        res,
        this.get.data,
        serverId
      )) as ServerDataResponse;
    },

    /**
    * Extract a file on a given server.
    *
    * @param serverId - The server to extract on
    * @param filename - The file to extract
    */
    extract: async (serverId: string, filename: string): Promise<void> => {
      await fetch(`${this.daemon}/server/${serverId}/extract/${filename}`, {
        headers: await this.defaultHeaders()
      });
    },

    /**
    * Gets the file listing on a given server.
    *
    * @param serverId - The server to query
    * @param [filename=""] The folder to index
    */
    file: async (
      serverId: string,
      filename = ""
    ): Promise<MessagesFileDesc[]> => {
      const res = await fetch(
        `${this.daemon}/server/${serverId}/file/${filename}`,
        {
          headers: await this.defaultHeaders()
        }
      );

      return (await this.handleResponse(
        res,
        this.get.file,
        serverId,
        filename
      )) as MessagesFileDesc[];
    },

    /**
    * Get the performance stats of a server.
    * If you want continuous performance stats, use a websocket.
    *
    * @param serverId - The server to query
    * @returns An object with cpu and memory usage
    */
    stats: async (serverId: string): Promise<PufferpanelServerStats> => {
      const res = await fetch(`${this.daemon}/server/${serverId}/stats`, {
        headers: await this.defaultHeaders()
      });

      return (await this.handleResponse(
        res,
        this.get.stats,
        serverId
      )) as PufferpanelServerStats;
    }
  };

  /**
  * Houses authentication-protected methods that create new data on the server.
  */
  public readonly create = {
    /**
     * Creates a new node.
     */
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

    /**
     * Creates a new user-scoped oauth2 client.
     */
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

    /**
     * Creates a new server.
     */
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

  /**
   * Houses all authentication-protected methods that modify data on the server.
   */
  public readonly edit = {
    /**
     * Edits the name of a given server.
     *
     * @param serverId - The server to edit
     * @param newName - The new name for the server
     */
    serverName: async (serverId: string, newName: string): Promise<void> => {
      await fetch(
        `${this.api}/servers/${serverId}/name/${encodeURIComponent(newName)}`,
        {
          method: MethodOpts.put,
          headers: await this.defaultHeaders()
        }
      );
    },

    /**
     * Updates settings for the current user.
     *
     * @param params - An object containing the new user settings as well as the correct password
     */
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

    /**
     * Update this Pufferpanel Instance's settings.
     *
     * @param params - The new settings for this Pufferpanel Instance
     */
    settings: async (params: UpdateServerParams): Promise<void> => {
      const res = await fetch(`${this.api}/settings`, {
        method: MethodOpts.post,
        headers: await this.defaultHeaders(),
        body: JSON.stringify(params)
      });

      if (!res.ok) {
        throw "Invalid server response";
      }
    }
  };


  /**
   * Houses authentication-protected methods that delete data on the server.
   */
  public readonly delete = {
    /**
     * Delete a node.
     *
     * @param nodeId - The node to delete
     */
    node: async (nodeId: string): Promise<void> => {
      await fetch(`${this.api}/node/${nodeId}`, {
        method: MethodOpts.delete,
        headers: await this.defaultHeaders()
      });
    },

    /**
    * Delete a user-scoped oauth2 client.
    * 
    * @param clientId - The OAuth2 client to delete
    */
    oauth2: async (clientId: string): Promise<void> => {
      await fetch(`${this.api}/self/oauth2/${clientId}`, {
        method: MethodOpts.delete,
        headers: await this.defaultHeaders()
      });
    },

    /**
     * Delete a server
     *
     * @param serverId - The server to delete
     */
    server: async (serverId: string): Promise<void> => {
      await fetch(`${this.api}/servers/${serverId}`, {
        method: MethodOpts.delete,
        headers: await this.defaultHeaders()
      });
    },

    /**
     * Delete a server-scoped OAuth2 client.
     *
     * @param serverId - The server to use
     * @param clientId - The OAuth2 client to delete
     */
    serverOauth2: async (serverId: string, clientId: string): Promise<void> => {
      await fetch(`${this.api}/servers/${serverId}/oauth2/${clientId}`, {
        method: MethodOpts.delete,
        headers: await this.defaultHeaders()
      });
    },

    /**
     * Revoke a users' permission to access a server
     *
     * @param serverId - The server to reference
     * @param userEmail - The email address of the user to revoke access from
     */
    serverUser: async (serverId: string, userEmail: string): Promise<void> => {
      await fetch(`${this.api}/servers/${serverId}/users/${userEmail}`, {
        method: MethodOpts.delete,
        headers: await this.defaultHeaders()
      });
    },

    /**
     * Delete a server template.
     *
     * @param name - The name of the server template to delete
     */
    template: async (name: string): Promise<void> => {
      await fetch(`${this.api}/templates/${name}`, {
        method: MethodOpts.delete,
        headers: await this.defaultHeaders()
      });
    },

    /**
     * Delete a user account. Requires admin privledges.
     *
     * @param userId - The user account to delete
     */
    user: async (userId: string): Promise<void> => {
      await fetch(`${this.api}/users/${userId}`, {
        method: MethodOpts.delete,
        headers: await this.defaultHeaders()
      });
    },

    /**
     * Delete a server as an administrator. Requires admin privledges.
     *
     * @param serverId - The server to delete
     */
    serverByAdmin: async (serverId: string): Promise<void> => {
      await fetch(`${this.daemon}/server/${serverId}`, {
        method: MethodOpts.delete,
        headers: await this.defaultHeaders()
      });
    },

    /**
     * Remove a file from a server.
     *
     * @param serverId - The server to reference
     * @param filename - The file/folder to delete
     */
    file: async (serverId: string, filename: string): Promise<void> => {
      await fetch(`${this.daemon}/server/${serverId}/file/${filename}`, {
        method: MethodOpts.delete,
        headers: await this.defaultHeaders()
      });
    }
  }

  /**
   * Miscellaneous authentication-protected methods that execute real-time actions on the server.
   */
  public readonly actions = {
    /**
     * Send a command to a server.
     *
     * @param serverId - The server to reference
     * @param command - The command to execute.
     */
    execute: async (serverId: string, command: string): Promise<void> => {
      await fetch(`${this.daemon}/server/${serverId}/console`, {
        headers: await this.defaultHeaders(),
        body: command
      });
    },

    /**
     * Forcibly stop a server.
     *
     * @param serverId - The server to force stop
     */
    kill: async (serverId: string): Promise<void> => {
      await fetch(`${this.daemon}/server/${serverId}/kill`, {
        method: MethodOpts.post,
        headers: await this.defaultHeaders()
      });
    },

    /**
     * Start a server.
     *
     * @param serverId - The server to start
     */
    start: async (serverId: string): Promise<void> => {
      await fetch(`${this.daemon}/server/${serverId}/start`, {
        method: MethodOpts.post,
        headers: await this.defaultHeaders()
      });
    },

    /**
     * Stop a server gracefully.
     *
     * @param serverId - The server to stop
     */
    stop: async (serverId: string): Promise<void> => {
      await fetch(`${this.daemon}/server/${serverId}/stop`, {
        method: MethodOpts.post,
        headers: await this.defaultHeaders()
      });
    }
  };

  /**
   * Obtain a websocket connected to a given server.
   *
   * @param id - The server to connect to
   * @returns A server websocket that can listen for server logs, start/stop status and performance stats.
   */
  public getSocket(id: string): PufferpanelSocket {
    const protocol = this.serverUrl.startsWith("https://") ? "wss://" : "ws://";
    const address = this.daemon.replace("https://", "").replace("http://", "");

    return new PufferpanelSocket(protocol + address + "/socket/" + id, Panel.cachedToken!);
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
