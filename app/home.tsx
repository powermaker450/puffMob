import CustomView from "@/components/CustomView";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Button, Text } from "react-native-paper";

export default function home() {
  const [text, setText] = useState("");

  useEffect(() => {
    AsyncStorage.getItem("settings").then(settings => {
      setText(settings || "");
    });
  }, []);

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
