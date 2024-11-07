import ButtonContainer from "@/components/ButtonContainer";
import CustomView from "@/components/CustomView";
import Server from "@/components/Server";
import Panel, { PanelParams } from "@/util/Panel";
import { ModelsServerView } from "@/util/models";
import { storage } from "@/util/storage";
import { useMaterial3Theme } from "@pchmn/expo-material3-theme";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { View, useColorScheme } from "react-native";
import { Button, Text } from "react-native-paper";

export default function home() {
  const { theme } = useMaterial3Theme();
  const buttonMargin = { marginTop: 20, marginBottom: 20, marginLeft: 5, marginRight: 5 };

  let settings: PanelParams = storage.getString("settings")
    ? JSON.parse(storage.getString("settings")!)
    : {
      serverUrl: "",
      clientId: "",
      clientSecret: ""
    };

  const [error, setError] = useState(false);
  let panel: Panel;
  const [serverList, setServerList] = useState<ModelsServerView[]>([]);

  if (settings) {
    panel = new Panel({...settings});
  }

  useEffect(() => {
    panel.get.servers()
      .then(({ servers }) => setServerList(servers))
      .catch(() => setError(true));
  }, []);

  const errorScreen = (
    <>
      <Text style={{ maxWidth: "85%", margin: 10 }} variant="bodyLarge">
        An error occured. Please check that your endpoint and credentials are correct.
      </Text>

      <Button
        mode="contained-tonal"
        onPress={() => {
          router.replace("/")
          setError(false);
        }}
        style={{...buttonMargin}}
      >
        Back
      </Button>
    </>
  );

  const normalView = (
    <>
      <Text style={{ maxWidth: "75%", margin: 20 }} variant="displaySmall">
        Servers
      </Text>

      <View style={{
        backgroundColor: useColorScheme() === "dark" ? theme.dark.surfaceVariant : theme.light.surfaceVariant,
        paddingLeft: 20,
        paddingRight: 20,
        maxWidth: "85%",
        borderRadius: 15
      }}>
        {serverList.map((server, index) => {
          return <Server name={server.name} ip={server.ip} port={server.port} key={index} />
        })}
      </View>

      <ButtonContainer>
        <Button
          mode="contained-tonal"
          onPress={() => {
            // setSettings({
            //   serverUrl: "",
            //   clientId: "",
            //   clientSecret: ""
            // });
            router.navigate("/");
            setError(false);
          }}
          style={{...buttonMargin}}
        >
          Back
        </Button>

        <Button
          mode="contained"
          onPress={() => {
            router.replace("/");
            setError(false);
            storage.delete("cachedToken");
          }}
          style={{...buttonMargin}}
        >
          Delete cached token
        </Button>
      </ButtonContainer>
    </>
  );

  return (
    <CustomView>
      {error ? errorScreen : normalView}
    </CustomView>
  )
}
