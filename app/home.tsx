import CustomView from "@/components/CustomView";
import Panel from "@/util/Panel";
import { PuffMobSettings, storage } from "@/util/storage";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Button, Text } from "react-native-paper";

const settings: PuffMobSettings = JSON.parse(storage.getString("settings")!);

const panel = new Panel({
  serverUrl: settings.endpoint,
  clientId: settings.clientId,
  clientSecret: settings.secret
});

export default function home() {
  const [text, setText] = useState("Waiting...");

  useEffect(() => {
    panel.getToken().then(token => setText(token));
  }, [])

  return (
    <CustomView>
      <Text style={{ maxWidth: "75%" }} variant="bodyLarge">
        {text}
      </Text>

      <Button
        mode="contained-tonal"
        onPress={() => router.replace("/")}
        style={{margin: 20}}
      >
        Back
      </Button>
    </CustomView>
  );
}
