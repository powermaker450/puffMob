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

import type Panel from "../Panel";
import { PanelSetting } from "../Panel";
import {
  ConfigResponse,
  MessagesFileDesc,
  ModelsChangeUserSetting,
  ModelsClient,
  ModelsDeployment,
  ModelsGetServerResponse,
  ModelsNodeView,
  ModelsPermissionView,
  ModelsServerSearchResponse,
  ModelsTemplate,
  ModelsUserSearchResponse,
  ModelsUserSettingView,
  ModelsUserView,
  NewClient,
  NewServerUser,
  PanelSettingResponse,
  PermissionsUpdate,
  PufferpanelDaemonRunning,
  PufferpanelServerLogs,
  PufferpanelServerRunning,
  PufferpanelServerStats,
  ServerDataResponse
} from "../models";

type ServerApiFetch = "oauth2" | "user" | "status";

type ServerDaemonFetch = "console" | "data" | "stats" | "status";

type SelfFetch = "otp" | "oauth2";

type GetEndpoint =
  | "/nodes"
  | `/nodes/${string}`
  | `/nodes/${string}/deployment`
  | "/self"
  | "/self/oauth2"
  | "/servers"
  | `/servers/${string}?perms`
  | `/servers/${string}/${ServerApiFetch}`
  | `/self/${SelfFetch}`
  | "/templates"
  | "/userSettings"
  | `/settings/${PanelSetting}`
  | `/users/${string}`
  | "/users"
  | `/users/${string}/perms`
  | "/"
  | "/config"
  | `/server/${string}/${ServerDaemonFetch}`
  | `/server/${string}/extract/${string}`
  | `/server/${string}/file/${string}`;

type GetReturn<E extends GetEndpoint> = E extends "/nodes"
  ? ModelsNodeView[]
  : E extends `/nodes/${string}/deployment`
    ? ModelsDeployment
    : E extends `/nodes/${string}`
      ? ModelsNodeView
      : E extends "/self"
        ? ModelsUserView
        : E extends "/self/oauth2" | `/servers/${string}/oauth2`
          ? ModelsClient[]
          : E extends "/servers"
            ? ModelsServerSearchResponse
            : E extends `/servers/${string}?perms`
              ? ModelsGetServerResponse
              : E extends `/servers/${string}/user`
                ? PermissionsUpdate[]
                : E extends `/server/${string}/status`
                  ? PufferpanelServerRunning
                  : E extends `/self/${SelfFetch}`
                    ? ModelsChangeUserSetting
                    : E extends "/templates"
                      ? ModelsTemplate[]
                      : E extends "/userSettings"
                        ? ModelsUserSettingView[]
                        : E extends `/settings/${PanelSetting}`
                          ? PanelSettingResponse
                          : E extends `/users/${string}`
                            ? ModelsUserView
                            : E extends "/users"
                              ? ModelsUserSearchResponse
                              : E extends `/users/${string}/perms`
                                ? ModelsPermissionView
                                : E extends "/"
                                  ? PufferpanelDaemonRunning
                                  : E extends "/config"
                                    ? ConfigResponse
                                    : E extends `/server/${string}/console`
                                      ? PufferpanelServerLogs
                                      : E extends `/server/${string}/data`
                                        ? ServerDataResponse
                                        : E extends `/server/${string}/extract/${string}`
                                          ? void
                                          : E extends `/server/${string}/file/${string}`
                                            ? MessagesFileDesc[]
                                            : E extends `/server/${string}/stats`
                                              ? PufferpanelServerStats
                                              : never;

export class Get {
  private panel: Panel;

  constructor(panel: Panel) {
    this.panel = panel;
  }

  private async fetch<E extends GetEndpoint, R extends GetReturn<E>>(
    endpoint: E
  ): Promise<R> {
    const route =
      (endpoint.startsWith("/server") && !endpoint.startsWith("/servers")) ||
      endpoint === "/"
        ? this.panel.daemon
        : this.panel.api;
    const fetcher = async () =>
      await fetch(route + endpoint, { method: "GET", headers: this.panel.headers });

    return (await this.panel.checkResponse(await fetcher(), fetcher)) as R;
  }

  /**
   * Request an array of nodes from the server.
   *
   * @returns An array of nodes
   */
  public async nodes(): Promise<ModelsNodeView[]> {
    return await this.fetch("/nodes");
  }

  /**
   * Request the data of a single node from the server.
   *
   * @param id - The node ID to request
   * @return The requested node associated with the node ID
   */
  public async node(id: string): Promise<ModelsNodeView> {
    return await this.fetch(`/nodes/${id}`);
  }

  public async nodeDeployment(id: string): Promise<ModelsDeployment> {
    return await this.fetch(`/nodes/${id}/deployment`);
  }

  /**
   * Sends a request for data about the current user.
   *
   * @returns The email, ID, and username of the current user.
   */
  public async self(): Promise<ModelsUserView> {
    return await this.fetch("/self");
  }

  /**
   * Get the OAuth2 clients of the current user.
   *
   * @returns An array of OAUTH2 clients, with id, name and description
   */
  public async selfOauth2(): Promise<ModelsClient[]> {
    return await this.fetch("/self/oauth2");
  }

  // TODO: Implement optional search parameters
  /**
   * Get the list of servers the current user is allowed to view.
   *
   * @returns An object with the paging value and an array of servers
   */
  public async servers(): Promise<ModelsServerSearchResponse> {
    const res = await this.fetch("/servers");

    for (const server of res.servers) {
      server.running = (
        await this.fetch(`/server/${server.id}/status`)
      ).running;

      server.actions = {
        execute: async (command: string) =>
          await this.panel.actions.execute(server.id, command),
        extract: async (filename: string) =>
          await this.extract(server.id, filename),
        install: async () => await this.panel.actions.install(server.id),
        kill: async () => await this.panel.actions.kill(server.id),
        start: async () => await this.panel.actions.start(server.id),
        stop: async () => await this.panel.actions.stop(server.id)
      };

      server.create = {
        oauth2: async (client: NewClient) =>
          await this.panel.create.serverOauth2(server.id, client),
        serverUser: async (email: string, perms: NewServerUser) =>
          await this.panel.create.serverUser(server.id, email, perms)
      };

      server.delete = {
        file: async (filename: string) =>
          await this.panel.delete.file(server.id, filename),
        oauth2: async (clientId: string) =>
          await this.panel.delete.serverOauth2(server.id, clientId),
        serverUser: async (email: string) =>
          await this.panel.delete.serverUser(server.id, email),
        user: async (email: string) =>
          await this.panel.delete.serverUser(server.id, email)
      };

      server.edit = {
        data: async (serverData: ServerDataResponse) =>
          await this.panel.edit.serverData(server.id, serverData),
        name: async (newName: string) =>
          await this.panel.edit.serverName(server.id, newName),
        user: async (email: string, perms: PermissionsUpdate) =>
          await this.panel.edit.serverUser(server.id, email, perms)
      };

      server.get = {
        console: async () => await this.console(server.id),
        data: async () => await this.data(server.id),
        file: async (filename?: string) => await this.file(server.id, filename),
        oauth2: async () => await this.serverOauth2(server.id),
        stats: async () => await this.stats(server.id),
        users: async () => await this.serverUsers(server.id)
      };
    }

    return res;
  }

  /**
   * Gets a server given that the user has permissions to view it.
   *
   * @param id - The server ID to query
   * @return The server associated with the ID
   */
  public async server(id: string): Promise<ModelsGetServerResponse> {
    const res = await this.fetch(`/servers/${id}?perms`);

    res.server.actions = {
      execute: async (command: string) =>
        await this.panel.actions.execute(res.server.id, command),
      extract: async (filename: string) =>
        await this.extract(res.server.id, filename),
      install: async () => await this.panel.actions.install(res.server.id),
      kill: async () => await this.panel.actions.kill(res.server.id),
      start: async () => await this.panel.actions.start(res.server.id),
      stop: async () => await this.panel.actions.stop(res.server.id)
    };

    res.server.create = {
      oauth2: async (client: NewClient) =>
        await this.panel.create.serverOauth2(res.server.id, client),
      serverUser: async (email: string, perms: NewServerUser) =>
        await this.panel.create.serverUser(res.server.id, email, perms)
    };

    res.server.delete = {
      file: async (filename: string) =>
        await this.panel.delete.file(res.server.id, filename),
      oauth2: async (clientId: string) =>
        await this.panel.delete.serverOauth2(res.server.id, clientId),
      serverUser: async (email: string) =>
        await this.panel.delete.serverUser(res.server.id, email),
      user: async (email: string) =>
        await this.panel.delete.serverUser(res.server.id, email)
    };

    res.server.edit = {
      data: async (serverData: ServerDataResponse) =>
        await this.panel.edit.serverData(res.server.id, serverData),
      name: async (newName: string) =>
        await this.panel.edit.serverName(res.server.id, newName),
      user: async (email: string, perms: PermissionsUpdate) =>
        await this.panel.edit.serverUser(res.server.id, email, perms)
    };

    res.server.get = {
      console: async () => await this.console(res.server.id),
      data: async () => await this.data(res.server.id),
      file: async (filename?: string) =>
        await this.file(res.server.id, filename),
      oauth2: async () => await this.serverOauth2(res.server.id),
      stats: async () => await this.stats(res.server.id),
      users: async () => await this.serverUsers(res.server.id)
    };

    res.server.socket = this.panel.getSocket(res.server.id);

    return res;
  }

  /**
   * Gets the list of OAuth2 clients for a given server.
   *
   * @param id - The server ID to query
   * @return An array of OAuth2 clients
   */
  public async serverOauth2(id: string): Promise<ModelsClient[]> {
    return await this.fetch(`/servers/${id}/oauth2`);
  }

  /**
   * Gets the users that have permissions on a given server.
   *
   * @param id - The server ID to query
   * @return An array of users and their permissions for this server
   */
  public async serverUsers(id: string): Promise<PermissionsUpdate[]> {
    return await this.fetch(`/servers/${id}/user`);
  }

  /**
   * Check if a server is running.
   * If you want to represent real-time server status, use a websocket instead.
   *
   * @param id - The server ID to query
   * @returns An object with `running` as boolean
   */
  public async serverStatus(id: string): Promise<PufferpanelServerRunning> {
    return await this.fetch(`/server/${id}/status`);
  }

  /**
   * Gets the value of a user setting
   *
   * @param key - The setting to check
   * @returns The value of the given setting
   */
  public async setting(key: SelfFetch): Promise<ModelsChangeUserSetting> {
    return await this.fetch(`/self/${key}`);
  }

  /**
   * Get all the templates the server offers.
   *
   * @returns An array of available templates
   */
  public async templates(): Promise<ModelsTemplate[]> {
    return await this.fetch("/templates");
  }

  /**
   * Gets the settings of the current user.
   *
   * @returns An array of settings associated with the current user
   */
  public async settings(): Promise<ModelsUserSettingView[]> {
    return await this.fetch("/userSettings");
  }

  /**
   * Gets a setting of the Pufferpanel Instance. Requires admin privledges.
   *
   * @param setting - The setting to query
   * @returns The value of the given setting
   */
  public async panelSetting(
    setting: PanelSetting
  ): Promise<PanelSettingResponse> {
    return await this.fetch(`/settings/${setting}`);
  }

  /**
   * Gets the details of a given user. Requires admin privledges.
   *
   * @id - The user ID to query
   * @returns Details associated with the given user ID
   */
  public async user(id: string): Promise<ModelsUserView> {
    return await this.fetch(`/users/${id}`);
  }

  /**
   * Get the list of all users on the panel. Requires view user privledges.
   *
   * @returns A list of users with paging response
   */
  public async users(): Promise<ModelsUserSearchResponse> {
    return await this.fetch("/users");
  }

  /**
   * Gets the global permissions of a given user. Requires admin privledges.
   *
   * @param id - The user ID to query
   * @returns An object containing the permissions the given user has
   */
  public async userPerms(id: string): Promise<ModelsPermissionView> {
    return await this.fetch(`/users/${id}/perms`);
  }

  /**
   * Check if the daemon is running.
   *
   * @returns An object, where `running` is boolean
   */
  public async daemon(): Promise<PufferpanelDaemonRunning> {
    return await this.fetch("/");
  }

  /**
   * Gets the settings of the Pufferpanel Instance set by the server admin, like instance name, theme, etc.
   *
   * @returns An object containing the settings of the Pufferpanel Instance
   */
  public async config(): Promise<ConfigResponse> {
    return await this.fetch("/config");
  }

  /**
   * Gets the logs of a given server.
   *
   * @param serverId - The server ID to query
   * @returns An object containing how far back the log data goes and the logs themselves
   */
  public async console(serverId: string): Promise<PufferpanelServerLogs> {
    return await this.fetch(`/server/${serverId}/console`);
  }

  /**
   * Gets the config data of a given server.
   *
   * @param serverId - The server to query
   * @returns An object containing `data`, which contains the config variables for the given server.
   */
  public async data(serverId: string): Promise<ServerDataResponse> {
    return await this.fetch(`/server/${serverId}/data`);
  }

  /**
   * Extract a file on a given server.
   *
   * @param serverId - The server to extract on
   * @param filename - The file to extract
   */
  public async extract(serverId: string, filename: string): Promise<void> {
    return await this.fetch(`/server/${serverId}/extract/${filename}`);
  }

  /**
   * Gets the file listing on a given server.
   *
   * @param serverId - The server to query
   * @param [filename=""] The folder to index
   */
  public async file(
    serverId: string,
    filename?: string
  ): Promise<MessagesFileDesc[]> {
    return await this.fetch(`/server/${serverId}/file/${filename || ""}`);
  }

  /**
   * Get the performance stats of a server.
   * If you want continuous performance stats, use a websocket.
   *
   * @param serverId - The server to query
   * @returns An object with cpu and memory usage
   */
  public async stats(serverId: string): Promise<PufferpanelServerStats> {
    return await this.fetch(`/server/${serverId}/stats`);
  }
}
