/*
 * puffMob: A mobile client for Pufferpanel
 * Copyright (C) 2024 powermaker450
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import CustomView from "@/components/CustomView";
import NavBar from "@/components/NavBar";
import ServerPage from "@/components/ServerPage";
import SettingsPage from "@/components/SettingsPage";
import Panel, { PanelParams } from "@/util/Panel";
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
        <NavBar
          routes={routes}
          renderScene={renderScene}
        />
      )}
    </>
  );
}
