import CustomView from "@/components/CustomView";
import ServerPage from "@/components/ServerPage";
import SettingsPage from "@/components/SettingsPage";
import Panel, { PanelParams } from "@/util/Panel";
import { handleTouch } from "@/util/haptic";
import { storage } from "@/util/storage";
import { useEffect, useState } from "react";
import { ActivityIndicator, BottomNavigation, Text } from "react-native-paper";

interface NavigationRoute {
  key: "servers" | "nodes" | "users" | "templates" | "settings";
  title: "Servers" | "Nodes" | "Users" | "Templates" | "Settings";
  focusedIcon: "server" | "server-network" | "people" | "file-code" | "cog";
}

const mainRoute: NavigationRoute = {
  key: "settings",
  title: "Settings",
  focusedIcon: "cog"
};

export default function home() {
  const [loading, setLoading] = useState(true);
  const loadingScreen = (
    <CustomView>
      <ActivityIndicator animating={loading} size="large" />

      <Text variant="bodyLarge" style={{ margin: 30 }}>
        Checking permissions...
      </Text>
    </CustomView>
  );

  const [index, setIndex] = useState(0);
  const [routes, setRoutes] = useState<NavigationRoute[]>([mainRoute]);

  useEffect(() => {
    const settings: PanelParams = storage.getString("settings")
      ? JSON.parse(storage.getString("settings")!)
      : null;

    const panel = new Panel(settings);
    panel.getScopes().then(scopes => {
      let newRoutes: NavigationRoute[] = [mainRoute];

      for (const scope of scopes) {
        switch (scope) {
          case "servers.view":
            newRoutes.unshift({
              key: "servers",
              title: "Servers",
              focusedIcon: "server"
            });
          default: {
          }
        }
      }

      setRoutes(newRoutes);
      setLoading(false);
    });
  }, []);

  const renderScene = BottomNavigation.SceneMap({
    servers: ServerPage,
    settings: SettingsPage
  });

  return (
    <>
      {loading ? (
        loadingScreen
      ) : (
        <BottomNavigation
          navigationState={{ index, routes }}
          onIndexChange={setIndex}
          onTabPress={handleTouch}
          sceneAnimationType="shifting"
          sceneAnimationEnabled
          renderScene={renderScene}
        />
      )}
    </>
  );
}
