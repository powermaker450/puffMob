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

type ActionEndpoint =
  | `/server/${string}/console`
  | `/server/${string}/kill`
  | `/server/${string}/start`
  | `/server/${string}/stop`
  | `/server/${string}/install`;

type ActionBody<E extends ActionEndpoint> =
  E extends `/server/${string}/console`
    ? string
    : E extends ActionEndpoint
      ? null
      : never;

export class Actions {
  private panel: Panel;

  constructor(panel: Panel) {
    this.panel = panel;
  }

  private async fetch<E extends ActionEndpoint, B extends ActionBody<E>>(
    endpoint: E,
    body: B
  ): Promise<void> {
    const fetcher = async () =>
    await fetch(this.panel.daemon + endpoint, { method: "POST", headers: this.panel.headers, body: body });

    return void (await this.panel.checkResponse(await fetcher(), fetcher));
  }

  /**
   * Send a command to a server.
   *
   * @param serverId - The server to reference
   * @param command - The command to execute.
   */
  public async execute(serverId: string, command: string): Promise<void> {
    return await this.fetch(`/server/${serverId}/console`, command);
  }

  /**
   * Forcibly stop a server.
   *
   * @param serverId - The server to force stop
   */
  public async kill(serverId: string): Promise<void> {
    return await this.fetch(`/server/${serverId}/kill`, null);
  }

  /**
   * Start a server.
   *
   * @param serverId - The server to start
   */
  public async start(serverId: string): Promise<void> {
    return await this.fetch(`/server/${serverId}/start`, null);
  }

  /**
   * Stop a server gracefully.
   *
   * @param serverId - The server to stop
   */
  public async stop(serverId: string): Promise<void> {
    return await this.fetch(`/server/${serverId}/stop`, null);
  }

  /**
   * Run a server's install script.
   *
   * @param serverId - The server to install
   */
  public async install(serverId: string): Promise<void> {
    return await this.fetch(`/server/${serverId}/install`, null);
  }
}
