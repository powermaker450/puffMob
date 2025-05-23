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

interface SocketEvent {
  type: "console" | "status" | "stat";
  data: object;
}

interface EventRequest {
  type: "replay" | "status" | "stat";
}

interface ReplayRequestEvent extends EventRequest {
  type: "replay";
  since: number;
}

export type PufferpanelEventRequest = EventRequest | ReplayRequestEvent;

export type PufferpanelEvent = "console" | "status" | "stat";

type CallbackType<T extends PufferpanelEvent> = T extends "console"
  ? (pse: { logs: string[] }) => any
  : T extends "status"
    ? (pse: { running: boolean }) => any
    : T extends "stat"
      ? (pse: { memory: number; cpu: number }) => any
      : never;

export default class PufferpanelSocket {
  private socket: WebSocket;

  constructor(url: string | URL, token: string) {
    // Sending Authorization through the websocket is possible, but tsc won't like it
    // https://stackoverflow.com/a/69366089
    // @ts-ignore
    this.socket = new WebSocket(url, null, {
      headers: {
        ["Authorization"]: `Bearer ${token}`
      }
    });

    this.socket.onopen = () => {
      console.log(`(${this.socket.url}) Connected!`);
      this.send("status");
      this.send("replay");

      const interval = setInterval(() => this.send("stat"), 2500);

      this.socket.onclose = ({ code, reason }) => {
        clearInterval(interval);
        console.log(`(${this.socket.url}) Closed:`, `(${code}) ${reason}`);
      };
    };
  }

  public on<T extends PufferpanelEvent>(
    eventType: T,
    listener: CallbackType<T>
  ): void {
    this.socket.addEventListener("message", m => {
      const packet: SocketEvent = JSON.parse(m.data);

      if (!packet.data || packet.type !== eventType) {
        return;
      }

      listener(packet.data as never);
    });
  }

  public send(message: "replay" | "status" | "stat"): void {
    const request: PufferpanelEventRequest =
      message === "replay"
        ? {
            type: message,
            since: 0
          }
        : {
            type: message
          };

    this.socket.send(JSON.stringify(request));
  }

  public close = () => this.socket.close();
}
