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
import {
  ModelsCreatedClient,
  ModelsNodeView,
  NewClient,
  NewServerUser,
  NewUser
} from "../models";

type CreateEndpoint =
  | "/nodes"
  | "/self/oauth2"
  | `/servers/${string}/oauth2`
  | "/servers"
  | "/users"
  | `/servers/${string}/user/${string}`;

type CreateBody<E extends CreateEndpoint> = E extends "/nodes"
  ? null
  : E extends "/self/oauth2" | `/servers/${string}/oauth2`
    ? NewClient
    : E extends "/users"
      ? NewUser
      : E extends `/servers/${string}/user/${string}`
        ? NewServerUser
        : never;

type CreateReturn<E extends CreateEndpoint> = E extends "/nodes"
  ? ModelsNodeView
  : E extends "/self/oauth2" | `/servers/${string}/oauth2`
    ? ModelsCreatedClient
    : E extends "/users" | `/servers/${string}/user/${string}`
      ? void
      : E extends "/servers"
        ? never
        : never;

export class Create {
  private panel: Panel;

  constructor(panel: Panel) {
    this.panel = panel;
  }

  private async fetch<
    E extends CreateEndpoint,
    B extends CreateBody<E>,
    R extends CreateReturn<E>
  >(endpoint: E, body: B): Promise<R> {
    const method = endpoint.match(
      /\/servers\/[A-Za-z0-9].*\/user\/[A-Za-z0-9].*/
    )
      ? "PUT"
      : "POST";
    const fetcher = async () =>
      await fetch(this.panel.api + endpoint, {
        method,
        headers: this.panel.headers,
        body: body ? JSON.stringify(body) : body
      });

    return (await this.panel.checkResponse(await fetcher(), fetcher)) as R;
  }

  /**
   * Creates a new node.
   */
  public async node(): Promise<ModelsNodeView> {
    return await this.fetch("/nodes", null);
  }

  /**
   * Creates a new user-scoped oauth2 client.
   */
  public async oauth2(client: NewClient): Promise<ModelsCreatedClient> {
    return await this.fetch("/self/oauth2", client);
  }

  /**
   * Creates a new server-scoped OAuth2 client.
   *
   * @param serverId - The server to create a new client for
   * @param client - Client Details
   * @returns The client id and secret of the new OAuth2 client.
   */
  public async serverOauth2(
    serverId: string,
    client: NewClient
  ): Promise<ModelsCreatedClient> {
    return await this.fetch(`/servers/${serverId}/oauth2`, client);
  }

  /**
   * Creates a new server.
   */
  public async server(): Promise<never> {
    throw new Error("Not implemented");
  }

  /**
   * Creates a new user on the panel. Requires admin privledges.
   *
   * @param params - The details to create the user with
   * @throws PufferpanelError
   */
  public async user(params: NewUser): Promise<void> {
    return await this.fetch("/users", params);
  }

  /**
   * Creates a new user on a given server.
   *
   * @param serverId - The server to reference
   * @param email - The user's email
   * @param perms - The permissions the new user will start with
   */
  public async serverUser(
    serverId: string,
    email: string,
    perms: NewServerUser
  ): Promise<void> {
    return await this.fetch(`/servers/${serverId}/user/${email}`, perms);
  }
}
