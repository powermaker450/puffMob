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

import PufferpanelError, { genericErr } from "./PufferpanelError";
import PufferpanelSocket from "./PufferpanelSocket";
import { Actions, Create, Delete, Edit, Get } from "./V2Methods";
import { ConfigResponse, PufferpanelErrorResponse } from "./models";
import { storage } from "./storage";

interface PanelData {
  settings: PanelParams;
  token: string;
}

/**
 * A class that wraps most if not all callable methods for Pufferpanel.
 */
export default class Panel {
  private readonly settings: PanelParams;
  private token: string;

  public readonly api: string;
  public readonly daemon: string;

  constructor({ settings, token }: PanelData) {
    this.settings = settings;
    this.token = token;

    this.api = settings.serverUrl + "/api";
    this.daemon = settings.serverUrl + "/proxy/daemon";
  }

  public get headers(): {
    Accept: "application/json";
    Authorization: `Bearer ${string}`;
    "User-Agent": "puffMob/0.3.1";
  } {
    return {
      Accept: "application/json",
      Authorization: `Bearer ${this.token}`,
      "User-Agent": "puffMob/0.3.1"
    };
  }

  /**
   * Log into a Pufferpanel server.
   *
   * @param user - Contains serverUrl, email, and password of the user
   * @returns An authentication packet containing the user scopes and session token
   */
  public static async login(user: PanelParams): Promise<AuthPacket> {
    const { serverUrl, email, password } = user;

    const res = await fetch(`${serverUrl}/auth/login`, {
      method: MethodOpts.post,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "User-Agent": "puffMob/0.3.1"
      },
      body: JSON.stringify({ email, password })
    });

    if (!res.ok) {
      throw new Error(await res.text().catch(() => "Login failed"));
    }

    return (await res.json()) as AuthPacket;
  }

  /**
   * Gets the settings of a given Pufferpanel Instance, like instance name, theme, etc.
   *
   * @returns An object containing the settings of the Pufferpanel Instance
   */
  public static async getConfig(serverName: string): Promise<ConfigResponse> {
    const res = await fetch(`${serverName}/api/config`);

    if (!res.ok) {
      throw new Error(await res.text().catch(() => "failed"));
    }

    return (await res.json()) as ConfigResponse;
  }

  /**
   * Check a response to see if it is valid.
   *
   * @param res - The response to check
   * @param retry - The function to call after re-authenticating if the response was invalid
   */
  public async checkResponse(
    res: Response,
    retry: () => Promise<Response>
  ): Promise<unknown> {
    switch (res.status) {
      case 204:
        return;
      case 400:
        throw new Error("Client send invalid data");
      case 401:
        const { session } = await Panel.login(this.settings);
        storage.set("cachedToken", session);
        this.token = session;

        // new block scope to avoid shadowing res in the whole switch
        {
          const res = await retry();
          return await res.json();
        }
      case 500:
        throw new Error("Internal server error");
      default:
        if (!res.ok) {
          let error: PufferpanelErrorResponse;

          try {
            error = await res.json();
          } catch {
            throw new PufferpanelError(genericErr());
          }

          throw new PufferpanelError(error);
        }

        return await res.json();
    }
  }

  public readonly get = new Get(this);
  public readonly create = new Create(this);
  public readonly edit = new Edit(this);
  public readonly delete = new Delete(this);
  public readonly actions = new Actions(this);

  /**
   * Obtain a websocket connected to a given server.
   *
   * @param id - The server to connect to
   * @returns A server websocket that can listen for server logs, start/stop status and performance stats.
   */
  public getSocket(id: string): PufferpanelSocket {
    const protocol = this.settings.serverUrl.startsWith("https://")
      ? "wss://"
      : "ws://";
    const address = this.daemon.replace("https://", "").replace("http://", "");

    return new PufferpanelSocket(
      protocol + address + "/socket/" + id,
      this.token
    );
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
