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
import { UpdateServerParams, UpdateUserParams } from "../Panel";
import {
  ModelsPermissionView,
  PermissionsUpdate,
  ServerDataResponse
} from "../models";

type PostEndpoint = `/users/${string}` | "/settings" | `/server/${string}/data`;

type PutEndpoint =
  | `/servers/${string}/name/${string}`
  | "/self"
  | `/users/${string}/perms`
  | `/servers/${string}/user/${string}`;

type EditBody<E extends PostEndpoint | PutEndpoint> =
  E extends `/servers/${string}/name/${string}`
    ? null
    : E extends "/self"
      ? UpdateUserParams
      : E extends `/users/${string}` | `/users/${string}/perms`
        ? ModelsPermissionView
        : E extends "/settings"
          ? UpdateServerParams
          : E extends `/servers/${string}/user/${string}`
            ? PermissionsUpdate
            : E extends `/server/${string}/data`
              ? ServerDataResponse
              : never;

export class Edit {
  private panel: Panel;

  constructor(panel: Panel) {
    this.panel = panel;
  }

  private async post<E extends PostEndpoint, B extends EditBody<E>>(
    endpoint: E,
    body: B
  ): Promise<void> {
    const route =
      endpoint.startsWith("/server") && !endpoint.startsWith("/servers")
        ? this.panel.daemon
        : this.panel.api;
    const fetcher = async () =>
      await fetch(route + endpoint, {
        method: "POST",
        headers: this.panel.headers,
        body: body ? JSON.stringify(body) : body
      });

    return void (await this.panel.checkResponse(await fetcher(), fetcher));
  }

  private async put<E extends PutEndpoint, B extends EditBody<E>>(
    endpoint: E,
    body: B
  ): Promise<void> {
    const fetcher = async () =>
      await fetch(this.panel.api + endpoint, {
        method: "PUT",
        headers: this.panel.headers,
        body: body ? JSON.stringify(body) : body
      });

    return void (await this.panel.checkResponse(await fetcher(), fetcher));
  }

  /**
   * Edits the name of a given server.
   *
   * @param serverId - The server to edit
   * @param newName - The new name for the server
   */
  public async serverName(serverId: string, newName: string): Promise<void> {
    return await this.put(`/servers/${serverId}/name/${newName}`, null);
  }

  /**
   * Updates settings for the current user.
   *
   * @param params - An object containing the new user settings as well as the correct password
   */
  public async self(params: UpdateUserParams): Promise<void> {
    return await this.put("/self", params);
  }

  /**
   * Updates details for a given user.
   *
   * @param id - The ID of the user to edit
   */
  public async user(
    id: string | number,
    params: ModelsPermissionView
  ): Promise<void> {
    return await this.post(`/users/${id}`, params);
  }

  /**
   * Updates permissions for a given user.
   *
   * @param id - The ID of the user to edit.
   */
  public async userPerms(
    id: string | number,
    params: ModelsPermissionView
  ): Promise<void> {
    return await this.put(`/users/${id}/perms`, params);
  }

  /**
   * Update this Pufferpanel Instance's settings.
   *
   * @param params - The new settings for this Pufferpanel Instance
   */
  public async settings(params: UpdateServerParams): Promise<void> {
    return await this.post("/settings", params);
  }

  /**
   * Edit a user on a given server.
   *
   * @param serverId - The server to reference
   * @param email - The user's email
   * @param perms - The new list of permissions the user will have
   */
  public async serverUser(
    serverId: string,
    email: string,
    perms: PermissionsUpdate
  ): Promise<void> {
    return await this.put(`/servers/${serverId}/user/${email}`, perms);
  }

  /**
   * Update a given server's installer data.
   *
   * @param serverId - The server to reference
   * @param data - The new server config
   */
  public async serverData(
    serverId: string,
    data: ServerDataResponse
  ): Promise<void> {
    return await this.post(`/server/${serverId}/data`, data);
  }
}
