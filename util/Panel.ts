export interface PanelParams {
  serverUrl: string;
  clientId: string;
  clientSecret: string;
}

export interface AuthPacket {
  access_token: string;
  expires_in: number;
  scope: "oauth2.auth";
  token_type: "Bearer";
}

export enum HeaderOpts {
  form = "application/x-www-form-urlencoded",
  json = "application/json"
}

export enum MethodOpts {
  get = "GET",
  post = "POST"
}

export default class Panel {
  public readonly serverUrl: string;
  public readonly clientId: string;
  public readonly clientSecret: string;

  constructor({ serverUrl, clientId, clientSecret }: PanelParams) {
    this.serverUrl = serverUrl;
    this.clientId = clientId;
    this.clientSecret = clientSecret;
  }

  private async getRequestOpts(option: MethodOpts) {
    return {
      method: option,
      headers: {
        ...Panel.genHeader(HeaderOpts.json),
        Authorization: `Bearer ${await this.getToken()}`
      }
    };
  }

  private static genHeader(header: HeaderOpts) {
    return {
      "Content-Type": header
    };
  }

  public async getToken(): Promise<string> {
    try {
      const res = await fetch(`${this.serverUrl}/oauth2/token`, {
        method: MethodOpts.post,
        headers: Panel.genHeader(HeaderOpts.form),
        body: `grant_type=client_credentials&client_id=${this.clientId}&client_secret=${this.clientSecret}`
      });

      if (!res.ok) {
        throw new Error("Failed to obtain token.");
      }

      return await res.json().then((packet: AuthPacket) => packet.access_token);
    } catch (err) {
      throw new Error("Failed to obtain token.");
    }
  }

  public async apiSelf() {
    try {
      const res = await fetch(`${this.serverUrl}/api/self`, {
        ...(await this.getRequestOpts(MethodOpts.get))
      });

      if (!res.ok) {
        throw new Error("An error occured fetching /api/self.");
      }

      return await res.json();
    } catch (err) {
      throw new Error("An error occured fetching /api/self.");
    }
  }
}
