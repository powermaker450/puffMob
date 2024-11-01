import CustomView from "@/components/CustomView";
import { useState } from "react";
import { View } from "react-native";
import { BottomNavigation, Button, Text, TextInput } from "react-native-paper";

type NavBarPage = {
  key: string;
  title: string;
  focusedIcon: string;
  unfocusedIcon?: string;
}

export default function Index() {
  const [clientIdText, setClientIdText] = useState("");

  const [endpoint, setEndpoint] = useState("");
  const [tokenText, setTokenText] = useState("");

  const [text, changeText] = useState("");

  const useToken = (id: string, token: string) => {
    fetch(`https://hosting.povario.com/oauth2/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: `grant_type=client_credentials&client_id=${id}&client_secret=${token}`
    })
    .then(response => {
        if (!response.ok) {
          changeText("Something went wrong.");
          return;
        }

        response.json()
        .then(json => {
            changeText(`Token expires in: ${json.expires_in / 60 / 60} ${json.expires_in / 60 / 60 > 1 ? "hours" : "hour"}`);
          });
      })
    .catch(err => {
        changeText("Something went wrong.");
        console.error(err);
      })
  }

  const Settings = () => (
    <CustomView>
      <Text variant="titleLarge">
        Settings
      </Text>
    </CustomView>
  );

  const Main = () => (
    <CustomView>
      <TextInput
        mode="outlined"
        style={{maxHeight: 70, width: "75%", margin: 10}}
        label="Client ID"
        value={clientIdText}
        onChangeText={newText => setClientIdText(newText)}
      >
      </TextInput>

      <TextInput
        mode="outlined"
        style={{maxHeight: 70, width: "75%", margin: 10}}
        label="Token"
        value={tokenText}
        onChangeText={newText => setTokenText(newText)}
      >
      </TextInput>

      <View
        style={{display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center"}}
      >
        <Button
          style={{margin: 10}}
          mode="contained"
          onPress={() => useToken(clientIdText, tokenText)}
        >
          Login
        </Button>
      </View>

      <Text
        style={{height: 60, maxWidth: "75%"}}
        variant="bodyLarge">
        {text}
      </Text>
    </CustomView>
  )

  const [index, setIndex] = useState(0);
  const [routes] = useState<NavBarPage[]>([
    {
      key: "home",
      title: "Home",
      focusedIcon: "home"
    },
    {
      key: "settings",
      title: "Settings",
      focusedIcon: "cog"
    }
  ]);

  const renderScene = BottomNavigation.SceneMap({
    home: Main,
    settings: Settings
  });

  return (
    <BottomNavigation
      navigationState={{ index, routes }}
      onIndexChange={setIndex}
      renderScene={renderScene}
      sceneAnimationType="shifting"
    />
  )
}
