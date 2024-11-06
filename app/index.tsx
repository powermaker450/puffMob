import ButtonContainer from "@/components/ButtonContainer";
import CustomView from "@/components/CustomView";
import { PanelParams } from "@/util/Panel";
import { storage } from "@/util/storage";
import { Redirect, router } from "expo-router";
import { useEffect, useState } from "react";
import { StyleProp, TextStyle, View } from "react-native";
import { useMMKVObject, useMMKVString } from "react-native-mmkv";
import { Button, Text, TextInput } from "react-native-paper";

const textInputStyle: StyleProp<TextStyle> = {
  maxHeight: 70,
  width: "75%",
  margin: 10
};

export default function Index() {
  const [settings, setSettings] = useMMKVObject<PanelParams>("settings");

  const setServerUrl = (text: string) => setSettings({
    serverUrl: text,
    clientId: settings?.clientId || "",
    clientSecret: settings?.clientSecret || ""
  });

  const setClientId = (text: string) => setSettings({
    serverUrl: settings?.serverUrl || "",
    clientId: text,
    clientSecret: settings?.clientSecret || ""
  });

  const setClientSecret = (text: string) => setSettings({
    serverUrl: settings?.serverUrl || "",
    clientId: settings?.clientId || "",
    clientSecret: text
  });

  return (
    <CustomView>
      {storage.getString("cachedToken") && <Redirect href="/servers" />}

      <Text variant="displaySmall" style={{ margin: 30 }}>
        puffMob
      </Text>

      <TextInput
        mode="outlined"
        style={textInputStyle}
        label="Endpoint"
        value={settings?.serverUrl}
        placeholder="http://localhost:8080"
        onChangeText={newText => {setServerUrl(newText)}}
      />

      <TextInput
        mode="outlined"
        style={textInputStyle}
        label="Client ID"
        value={settings?.clientId}
        onChangeText={newText => setClientId(newText)}
      />

      <TextInput
        mode="outlined"
        style={textInputStyle}
        label="Token"
        value={settings?.clientSecret}
        secureTextEntry
        textContentType="password"
        onChangeText={newText => setClientSecret(newText)}
      />

      <ButtonContainer>
        <Button
          style={{ margin: 10 }}
          mode="contained"
          onPress={() => router.navigate("/servers")}
          disabled={
            !(settings?.serverUrl && (settings.serverUrl.startsWith("http://") || settings.serverUrl.startsWith("https://")))
            || !settings?.clientId || !settings?.clientSecret
          }
        >
          Login
        </Button>
      </ButtonContainer>
    </CustomView>
  );
}
