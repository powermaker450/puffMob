import Panel, { PanelParams } from "@/util/Panel";
import { ModelsServerView } from "@/util/models";
import { storage } from "@/util/storage";
import { router, useNavigation } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, View } from "react-native";
import {
  ActivityIndicator,
  Button,
  FAB,
  Text,
  useTheme
} from "react-native-paper";
import Server from "./Server";
import CustomView from "./CustomView";

export default function ServerPage() {
  const theme = useTheme();

  let settings: PanelParams = storage.getString("settings")
    ? JSON.parse(storage.getString("settings")!)
    : null;

  const [error, setError] = useState(false);
  const serverCache: ModelsServerView[] = storage.getString("cachedServerList")
    ? JSON.parse(storage.getString("cachedServerList")!)
    : [];
  const [serverList, setServerList] = useState<ModelsServerView[]>(serverCache);
  const [loading, setLoading] = useState(true);

  let panel: Panel;
  if (settings) {
    panel = new Panel(settings);
  }

  const navigation = useNavigation();
  useEffect(() => {
    panel.get
      .servers()
      .then(({ servers }) => {
        storage.set("cachedServerList", JSON.stringify(servers));
        setServerList(servers);
        setLoading(false);
      })
      .catch(() => setError(true));
  }, [])

  useEffect(() => {
    navigation.addListener("focus", () => {
      panel.get
        .servers()
        .then(({ servers }) => {
          storage.set("cachedServerList", JSON.stringify(servers));
          setServerList(servers);
          setLoading(false);
        })
        .catch(() => setError(true));
    });
  }, [navigation]);

  const errorScreen = (
    <>
      <Text style={{ maxWidth: "85%", margin: 10 }} variant="bodyLarge">
        An error occured. Please check that your endpoint and credentials are
        correct.
      </Text>

      <Button
        mode="contained-tonal"
        onPress={() => {
          router.replace("/");
          setError(false);
        }}
      >
        Back
      </Button>
    </>
  );

  const loadingIcon = (
    <ActivityIndicator
      animating={true}
      size="large"
      style={{ paddingTop: 30, paddingBottom: 30 }}
    />
  );

  const normalView = (
    <>
      <View
        style={{
          paddingLeft: 20,
          paddingRight: 20,
          paddingTop: 10,
          paddingBottom: 10,
          maxHeight: "85%",
          width: "100%",
          borderRadius: 20
        }}
      >
        <ScrollView>
          {serverCache.length === 0 && loading
            ? loadingIcon
            : serverList.map((server, index) => {
                return (
                  <Server
                    name={server.name}
                    id={server.id}
                    ip={server.ip}
                    port={server.port}
                    key={index}
                    node={server.node}
                    running={server.running}
                  />
                );
              })}
        </ScrollView>
      </View>

      <FAB
        icon="plus"
        disabled={true}
        style={{ position: "absolute", bottom: 25, right: 25 }}
      />
    </>
  );

  return <CustomView>{error ? errorScreen : normalView}</CustomView>;
}
