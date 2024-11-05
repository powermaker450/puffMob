import CustomView from "@/components/CustomView";
import { AuthPacket } from "@/util/Panel";
import { storage } from "@/util/storage";
import { Redirect, router } from "expo-router";
import { useState } from "react";
import { StyleProp, TextStyle, View } from "react-native";
import { Button, Text, TextInput } from "react-native-paper";

const textInputStyle: StyleProp<TextStyle> = {
  maxHeight: 70,
  width: "75%",
  margin: 10
};

export default function Index() {
  const [endpoint, setEndpoint] = useState("");
  const [tokenText, setTokenText] = useState("");
  const [clientIdText, setClientIdText] = useState("");
  const [statusText, setStatusText] = useState("");

  const login = () => {
    fetch(`${endpoint || "http://localhost:8080"}/oauth2/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: `grant_type=client_credentials&client_id=${clientIdText}&client_secret=${tokenText}`
    })
      .then(async response => {
        if (!response.ok) {
          setStatusText("Something went wrong.");
        }

        await response.json().then((auth: AuthPacket) => {
          const settings = {
            endpoint: endpoint,
            clientId: clientIdText,
            clientSecret: tokenText
          };

          console.log("Got token:", auth);

          storage.set("settings", JSON.stringify(settings));

          router.navigate("/home");
        });
      })
      .catch(err => {
        setStatusText("Something went wrong.");
        console.error(err);
      });
  };

  return (
    <CustomView>
      {storage.contains("settings") && <Redirect href="/home" />}
      <Text variant="displaySmall" style={{ margin: 30 }}>
        puffMob
      </Text>

      <TextInput
        mode="outlined"
        style={textInputStyle}
        label="Endpoint"
        value={endpoint}
        placeholder="http://localhost:8080"
        onChangeText={newText => setEndpoint(newText)}
      />

      <TextInput
        mode="outlined"
        style={textInputStyle}
        label="Client ID"
        value={clientIdText}
        onChangeText={newText => setClientIdText(newText)}
      />

      <TextInput
        mode="outlined"
        style={textInputStyle}
        label="Token"
        value={tokenText}
        secureTextEntry
        textContentType="password"
        onChangeText={newText => setTokenText(newText)}
      />

      <View
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center"
        }}
      >
        <Button style={{ margin: 10 }} mode="contained" onPress={() => login()}>
          Login
        </Button>
      </View>

      <Text style={{ height: 60, maxWidth: "75%" }} variant="bodyLarge">
        {statusText}
      </Text>
    </CustomView>
  );
}
