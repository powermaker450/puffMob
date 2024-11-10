import AccountPage from "@/components/AccountPage";
import CustomView from "@/components/CustomView";
import Server from "@/components/Server";
import Panel, { PanelParams } from "@/util/Panel";
import { ModelsServerView } from "@/util/models";
import { storage } from "@/util/storage";
import { router, useNavigation } from "expo-router";
import React, { useEffect, useState } from "react";
import { ScrollView, View } from "react-native";
import {
  ActivityIndicator,
  BottomNavigation,
  Button,
  FAB,
  Text,
  useTheme
} from "react-native-paper";

export default function home() {
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
        correct and that the server is online.
      </Text>

      <Button
        mode="contained"
        onPress={() => {
          storage.delete("cachedToken");
          storage.delete("cachedServerList");
          router.replace("/");
        }}
      >
        Logout
      </Button>
    </>
  );

  const loadingIcon = (
    <ActivityIndicator
      animating={loading}
      size="large"
      style={{ paddingTop: 30, paddingBottom: 30 }}
    />
  );

  const normalView = (
    <>
      <View
        style={{
          backgroundColor: theme.colors.surfaceVariant,
          paddingLeft: 20,
          paddingRight: 20,
          paddingTop: 10,
          paddingBottom: 10,
          maxHeight: "85%",
          width: "85%",
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

  const serverPage = () => (
    <CustomView>{error ? errorScreen : normalView}</CustomView>
  );

  const NavigationBar = () => {
    const [index, setIndex] = useState(0);

    const [routes] = useState([
      { key: "servers", title: "Servers", focusedIcon: "server" },
      { key: "settings", title: "Settings", focusedIcon: "cog" }
    ]);

    const renderScene = BottomNavigation.SceneMap({
      servers: serverPage,
      settings: AccountPage
    });

    return (
      <BottomNavigation
        navigationState={{ index, routes }}
        onIndexChange={setIndex}
        renderScene={renderScene}
      />
    );
  };

  return error ? <></> : <NavigationBar />;
}
