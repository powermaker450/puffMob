import Panel, { AuthScope, PanelParams } from "@/util/Panel";
import { ConfigResponse } from "@/util/models";
import { storage } from "@/util/storage";
import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState
} from "react";

interface PanelProviderProps {
  children: ReactNode;
}

interface PanelData {
  panel: Panel;
  settings: PanelParams;
  applySettings: (newSettings: PanelParams) => void;
  applyServerUrl: (serverUrl: string) => void;
  applyEmail: (email: string) => void;
  applyPassword: (password: string) => void;
  username: string;
  applyUsername: (newUsername: string) => void;
  config: ConfigResponse;
  scopes: AuthScope[];
  loggedIn: boolean;
  token: string;
  error: boolean;
  clearError: () => void;
  login: (user: PanelParams) => Promise<void>;
  logout: () => void;
}

const PanelContext = createContext<PanelData | undefined>(undefined);

export const PanelProvider = ({ children }: PanelProviderProps) => {
  const [settings, setSettings] = useState<PanelParams>(
    storage.getString("settings")
      ? JSON.parse(storage.getString("settings")!)
      : { serverUrl: "", email: "", password: "" }
  );
  const applySettings = (user: PanelParams) => {
    setSettings(user);
    storage.set("settings", JSON.stringify(user));
  };

  const applyServerUrl = (serverUrl: string) =>
    setSettings(v => {
      const newServerUrl: PanelParams = { ...v, serverUrl };

      storage.set("settings", JSON.stringify(newServerUrl));
      return newServerUrl;
    });
  const applyEmail = (email: string) =>
    setSettings(v => {
      const newSettings: PanelParams = { ...v, email };

      storage.set("settings", JSON.stringify(newSettings));
      return newSettings;
    });
  const applyPassword = (password: string) =>
    setSettings(v => {
      const newPassword: PanelParams = { ...v, password };

      storage.set("settings", JSON.stringify(newPassword));
      return newPassword;
    });

  const [username, setUsername] = useState(storage.getString("username") || "");
  const applyUsername = (newUsername: string) => {
    storage.set("username", newUsername);
    setUsername(newUsername);
  };

  const [scopes, setScopes] = useState(
    storage.getString("cachedScopes")
      ? JSON.parse(storage.getString("cachedScopes")!)
      : []
  );
  const applyScopes = (scopes: AuthScope[]) => {
    setScopes(scopes);
    storage.set("cachedScopes", JSON.stringify(scopes));
  };

  const [token, setToken] = useState(storage.getString("cachedToken") ?? "");
  const applyToken = (token: string) => {
    storage.set("cachedToken", token);
    setToken(token);
  };

  const [loggedIn, setLoggedIn] = useState(
    storage.getBoolean("loggedIn") ?? false
  );
  const applyLoggedIn = (loggedIn: boolean) => {
    setLoggedIn(loggedIn);
    storage.set("loggedIn", loggedIn);
  };

  const [config, setConfig] = useState<ConfigResponse>(
    storage.getString("config")
      ? JSON.parse(storage.getString("config")!)
      : {
          branding: { name: "Pufferpanel" },
          registrationEnabled: false,
          themes: {
            active: "Pufferpanel",
            available: ["Pufferanel"]
          }
        }
  );
  const applyConfig = (newConfig: ConfigResponse) => {
    setConfig(newConfig);
    storage.set("config", JSON.stringify(newConfig));
  };

  const [panel, setPanel] = useState<Panel>(new Panel({ settings, token }));
  useEffect(() => applyLoggedIn(!!token), [token]);
  const [error, setError] = useState(false);
  const clearError = () => setError(false);

  async function login(user: PanelParams) {
    try {
      const { session, scopes } = await Panel.login(user);

      applySettings(user);
      setPanel(new Panel({ settings: user, token: session }));
      applyToken(session);
      applyScopes(scopes ?? []);

      applyConfig(await Panel.getConfig(user.serverUrl));
    } catch {
      setError(true);
    }
  }

  useEffect(() => {
    if (!token) {
      return;
    }

    panel.get.self().then(({ username }) => applyUsername(username ?? ""));
  }, [panel]);

  function logout() {
    const empty: PanelParams = { serverUrl: "", email: "", password: "" };

    applySettings(empty);
    setToken("");
    setPanel(new Panel({ settings: empty, token: "" }));
    storage.clearAll();
  }

  return (
    <PanelContext.Provider
      value={{
        panel,
        config,
        settings,
        applySettings,
        applyServerUrl,
        applyEmail,
        applyPassword,
        username,
        applyUsername,
        token,
        scopes,
        loggedIn,
        error,
        clearError,
        login,
        logout
      }}
    >
      {children}
    </PanelContext.Provider>
  );
};

export const usePanel = () => {
  const context = useContext(PanelContext);

  if (context === undefined) {
    throw new Error("usePanel must be called within a PanelContext");
  }

  return context;
};
