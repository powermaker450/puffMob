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

import NavBar from "@/components/NavBar";
import ServerPage from "@/components/server/ServerPage";
import SettingsPage from "@/components/SettingsPage";
import { usePanel } from "@/contexts/PanelProvider";
import { useEffect, useState } from "react";
import { BottomNavigation } from "react-native-paper";

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
  const { scopes } = usePanel();

  const [routes, setRoutes] = useState<NavigationRoute[]>([mainRoute]);

  useEffect(() => {
    let newRoutes: NavigationRoute[] = [mainRoute];

    for (const scope of scopes) {
      switch (scope) {
        case "servers.view":
          newRoutes.unshift({
            key: "servers",
            title: "Servers",
            focusedIcon: "server"
          });
      }
    }

    setRoutes(newRoutes);
  }, []);

  const renderScene = BottomNavigation.SceneMap({
    servers: ServerPage,
    settings: SettingsPage
  });

  return <NavBar routes={routes} renderScene={renderScene} />;
}
