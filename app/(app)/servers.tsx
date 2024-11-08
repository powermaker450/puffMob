import ButtonContainer from "@/components/ButtonContainer";
import CustomView from "@/components/CustomView";
import Server from "@/components/Server";
import Panel, { PanelParams } from "@/util/Panel";
import { ModelsServerView } from "@/util/models";
import { storage } from "@/util/storage";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { ActivityIndicator, Button, Text, useTheme } from "react-native-paper";

export default function home() {
  const theme = useTheme();
  const buttonMargin = { marginTop: 20, marginBottom: 20, marginLeft: 5, marginRight: 5 };

  let settings: PanelParams = storage.getString("settings")
    ? JSON.parse(storage.getString("settings")!)
    : {
      serverUrl: "",
      clientId: "",
      clientSecret: ""
    };

  const [error, setError] = useState(false);
  const serverCache: ModelsServerView[] = storage.getString("cachedServerList")
    ? JSON.parse(storage.getString("cachedServerList")!)
    : [];
  const [serverList, setServerList] = useState<ModelsServerView[]>(serverCache);
  const [loading, setLoading] = useState(true);

  let panel: Panel;
  if (settings) {
    panel = new Panel({...settings});
  }

  useEffect(() => {
    panel.get.servers()
      .then(({ servers }) => {
        storage.set("cachedServerList", JSON.stringify(servers));
        setServerList(servers);
        setLoading(false);
      })
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

  const loadingIcon = (
    <ActivityIndicator
      animating={loading}
      size="large"
      style={{paddingTop: 30, paddingBottom: 30}}
    />
  );

  const normalView = (
    <>
      <Text style={{ maxWidth: "75%", margin: 20 }} variant="displaySmall">
        Servers
      </Text>

      <View style={{
        backgroundColor: theme.colors.surfaceVariant,
        paddingLeft: 20,
        paddingRight: 20,
        paddingTop: 10,
        paddingBottom: 10,
        width: "85%",
        borderRadius: 20
      }}>

        {serverCache.length === 0 && loading ? loadingIcon : serverList.map((server, index) => {
          return <Server
            name={server.name}
            ip={server.ip}
            port={server.port}
            key={index}
            node={server.node}
            running={server.running}
          />
        })}
      </View>

      <ButtonContainer>
        <Button
          mode="contained"
          onPress={() => {
            router.back();
            setError(false);
            storage.delete("cachedToken");
            storage.delete("cachedServerList");
          }}
          style={{...buttonMargin}}
        >
          Logout
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
