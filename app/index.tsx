import ButtonContainer from "@/components/ButtonContainer";
import CustomView from "@/components/CustomView";
import Panel, { PanelParams } from "@/util/Panel";
import { storage } from "@/util/storage";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { StyleProp, TextStyle } from "react-native";
import { Button, Text, TextInput } from "react-native-paper";

const textInputStyle: StyleProp<TextStyle> = {
  maxHeight: 70,
  width: "75%",
  margin: 10
};

export default function Index() {
  let settings: PanelParams = storage.getString("settings")
    ? (JSON.parse(storage.getString("settings")!))
    : ({
        serverUrl: "",
        clientId: "",
        clientSecret: ""
      });
  const [cachedToken, setStateCachedToken] = useState(storage.getString("cachedToken"));

  const setSettings = (params: PanelParams) => {
    storage.set("settings", JSON.stringify(params));
    settings = JSON.parse(storage.getString("settings")!);
  }

  const setCachedToken = (token: string) => {
    storage.set("cachedToken", token);
    setStateCachedToken(storage.getString("cachedToken"));
  }

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [serverUrl, setServerUrl] = useState("");
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  
  useEffect(() => {
    if (!cachedToken) {
      setLoading(false);
      return;
    }

    new Panel({...settings}).get.self()
      .then(() => {
        setLoading(false);
        router.navigate("/servers");
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      })
  }, [cachedToken]);

  const loadingText = (
    <CustomView>
      <Text variant="displaySmall" style={{ margin: 30 }}>
        Loading...
      </Text>
    </CustomView>
  );
  
  const errorText = (
    <CustomView>
      <Text variant="bodyLarge" style={{ margin: 30 }}>
        Something went wrong. Check that your server URL and credentials are correct.
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
        onChangeText={newText => {setServerUrl(newText)}}
      />

      <TextInput
        mode="outlined"
        style={textInputStyle}
        label="Client ID"
        value={clientId}
        onChangeText={newText => setClientId(newText)}
      />

      <TextInput
        mode="outlined"
        style={textInputStyle}
        label="Token"
        value={clientSecret}
        secureTextEntry
        textContentType="password"
        onChangeText={newText => setClientSecret(newText)}
      />

      <ButtonContainer>
        <Button
          style={{ margin: 10 }}
          mode="contained"
          onPress={() => {
            const params: PanelParams = {
              serverUrl: serverUrl,
              clientId: clientId,
              clientSecret: clientSecret
            };

            setSettings(params);

            Panel.getToken(params).then(token => setCachedToken(token));
          }}
          disabled={!(serverUrl.startsWith("http://") || serverUrl.startsWith("https://")) || !clientId || !clientSecret}
        >
          Login
        </Button>
      </ButtonContainer>
    </CustomView>
  );

  return (
    <>
      {error ? errorText : loading ? loadingText : loginText}
    </>
  );
}
