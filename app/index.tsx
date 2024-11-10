import ButtonContainer from "@/components/ButtonContainer";
import CustomView from "@/components/CustomView";
import Panel, { PanelParams } from "@/util/Panel";
import { storage } from "@/util/storage";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { StyleProp, TextStyle } from "react-native";
import { ActivityIndicator, Button, Text, TextInput } from "react-native-paper";

const textInputStyle: StyleProp<TextStyle> = {
  maxHeight: 70,
  width: "75%",
  margin: 10
};

export default function Index() {
  let settings: PanelParams = storage.getString("settings")
    ? JSON.parse(storage.getString("settings")!)
    : {
        serverUrl: "",
        email: "",
        password: ""
      };
  const [cachedToken, setStateCachedToken] = useState(
    storage.getString("cachedToken")
  );

  const setSettings = (params: PanelParams) => {
    storage.set("settings", JSON.stringify(params));
    settings = JSON.parse(storage.getString("settings")!);
  };

  const setCachedToken = (token: string) => {
    storage.set("cachedToken", token);
    setStateCachedToken(storage.getString("cachedToken"));
  };

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [serverUrl, setServerUrl] = useState(settings.serverUrl);
  const [email, setEmail] = useState(settings.email);
  const [password, setPassword] = useState(settings.password);

  useEffect(() => {
    if (!cachedToken) {
      setLoading(false);
      return;
    }

    new Panel(settings).get
      .self()
      .then(() => {
        setLoading(false);
        router.replace("/home");
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [cachedToken]);

  const loadingText = (
    <CustomView>
      <ActivityIndicator
        size="large"
        animating={loading}
        style={{ marginBottom: 20 }}
      />

      <Text variant="bodyLarge" style={{ margin: 30 }}>
        Logging in...
      </Text>
    </CustomView>
  );

  const errorText = (
    <CustomView>
      <Text variant="bodyLarge" style={{ margin: 30 }}>
        Something went wrong. Check that your server URL and credentials are
        correct.
      </Text>

      <Button
        mode="contained"
        style={{ margin: 10 }}
        onPress={() => {
          setError(false);
          setLoading(false);
        }}
      >
        Back to login
      </Button>
    </CustomView>
  );

  const loginText = (
    <CustomView>
      <Text variant="displaySmall" style={{ margin: 30 }}>
        puffMob
      </Text>

      <TextInput
        mode="outlined"
        style={textInputStyle}
        label="Endpoint"
        value={serverUrl}
        placeholder="http://localhost:8080"
        onChangeText={newText => {
          setServerUrl(newText);
        }}
      />

      <TextInput
        mode="outlined"
        style={textInputStyle}
        label="Email"
        value={email}
        onChangeText={newText => setEmail(newText)}
      />

      <TextInput
        mode="outlined"
        style={textInputStyle}
        label="Password"
        value={password}
        secureTextEntry
        textContentType="password"
        onChangeText={newText => setPassword(newText)}
      />

      <ButtonContainer>
        <Button
          style={{ margin: 10 }}
          mode="contained"
          onPress={() => {
            setLoading(true);

            const params: PanelParams = {
              serverUrl,
              email,
              password
            };
            setSettings(params);

            Panel.getToken(params)
              .then(token => setCachedToken(token))
              .catch(() => {
                setError(true);
                setLoading(false);
              });
          }}
          disabled={
            !(
              serverUrl.startsWith("http://") ||
              serverUrl.startsWith("https://")
            ) ||
            !email.match(/[a-zA-Z0-9].*@[a-zA-Z0-9].*\.[a-zA-Z0-9]/) ||
            !password
          }
        >
          Login
        </Button>
      </ButtonContainer>
    </CustomView>
  );

  return <>{error ? errorText : loading ? loadingText : loginText}</>;
}
