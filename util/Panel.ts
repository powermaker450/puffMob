export default class Panel {
  public readonly serverUrl: string;
  public readonly clientId: string;
  public readonly clientSecret: string;

  constructor({ serverUrl, clientId, clientSecret }: PanelParams) {
    this.serverUrl = serverUrl;
    this.clientId = clientId;
    this.clientSecret = clientSecret;
  }

  public async getToken(): Promise<string> {
    const res = await fetch(`${this.serverUrl}/oauth2/token`, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: `grant_type=client_credentials&client_id=${this.clientId}&client_secret=${this.clientSecret}` 
    });

    if (!res.ok) {
      throw new Error(await res.text());
    }

    return await res.json().then(r => r.toString());
  }
}

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

export enum MethodOpts {
  get = "GET",
  post = "POST"
}
