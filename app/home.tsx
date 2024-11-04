import CustomView from "@/components/CustomView";
import { PuffMobSettings, storage } from "@/util/storage";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Button, Text } from "react-native-paper";

export default function home() {
  const [text, setText] = useState("");
  const settings: PuffMobSettings = JSON.parse(storage.getString("settings")!);

  useEffect(() => {
    setText(settings.clientId);
  }, [settings])

  return (
    <CustomView>
      <Text style={{ maxWidth: "75%" }} variant="bodyLarge">
        {text}
      </Text>

      <Button mode="contained-tonal" onPress={() => router.back()}>
        Back
      </Button>
    </CustomView>
  );
}
