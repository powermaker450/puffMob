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

type DeleteEndpoint =
  | `/node/${string}`
  | `/self/oauth2/${string}`
  | `/servers/${string}`
  | `/servers/${string}/oauth2/${string}`
  | `/servers/${string}/user/${string}`
  | `/templates/${string}`
  | `/users/${string}`
  | `/server/${string}`
  | `/server/${string}/file/${string}`;

export class Delete {
  private panel: Panel;

  constructor(panel: Panel) {
    this.panel = panel;
  }

  private async fetch(endpoint: DeleteEndpoint): Promise<void> {
    const route =
      endpoint.startsWith("/server") && !endpoint.startsWith("/servers")
        ? this.panel.daemon
        : this.panel.api;
    const fetcher = async () =>
      await fetch(route + endpoint, { method: "DELETE", headers: this.panel.headers });

    return void (await this.panel.checkResponse(await fetcher(), fetcher));
  }

  /**
   * Delete a node.
   *
   * @param nodeId - The node to delete
   */
  public async node(nodeId: string): Promise<void> {
    return await this.fetch(`/node/${nodeId}`);
  }

  /**
   * Delete a user-scoped oauth2 client.
   *
   * @param clientId - The OAuth2 client to delete
   */
  public async oauth2(clientId: string): Promise<void> {
    return await this.fetch(`/self/oauth2/${clientId}`);
  }

  /**
   * Delete a server
   *
   * @param serverId - The server to delete
   */
  public async server(serverId: string): Promise<void> {
    return await this.fetch(`/servers/${serverId}`);
  }

  /**
   * Delete a server-scoped OAuth2 client.
   *
   * @param serverId - The server to use
   * @param clientId - The OAuth2 client to delete
   */
  public async serverOauth2(serverId: string, clientId: string): Promise<void> {
    return await this.fetch(`/servers/${serverId}/oauth2/${clientId}`);
  }

  /**
   * Revoke a users' permission to access a server
   *
   * @param serverId - The server to reference
   * @param userEmail - The email address of the user to revoke access from
   */
  public async serverUser(serverId: string, userEmail: string): Promise<void> {
    return await this.fetch(`/servers/${serverId}/user/${userEmail}`);
  }

  /**
   * Delete a server template.
   *
   * @param name - The name of the server template to delete
   */
  public async template(templateName: string): Promise<void> {
    return await this.fetch(`/templates/${templateName}`);
  }

  /**
   * Delete a user account. Requires admin privledges.
   *
   * @param userId - The user account to delete
   */
  public async user(userId: string): Promise<void> {
    return await this.fetch(`/users/${userId}`);
  }

  /**
   * Delete a server as an administrator. Requires admin privledges.
   *
   * @param serverId - The server to delete
   */
  public async serverByAdmin(serverId: string): Promise<void> {
    return await this.fetch(`/server/${serverId}`);
  }

  /**
   * Remove a file from a server.
   *
   * @param serverId - The server to reference
   * @param filename - The file/folder to delete
   */
  public async file(serverId: string, filename: string): Promise<void> {
    return await this.fetch(`/server/${serverId}/file/${filename}`);
  }
}
