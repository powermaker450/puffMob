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

import Panel from "@/util/Panel";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { useEffect, useState } from "react";
import { BottomNavigationRoute, BottomNavigation } from "react-native-paper";
import PufferpanelSocket from "@/util/PufferpanelSocket";
import ConsoleView from "@/components/server/ConsoleView";
import NavBar from "@/components/NavBar";
import ServerManagePage from "@/components/server/ServerManagePage";
import NameTab from "@/components/server/NameTab";
import FilesPage from "@/components/server/FilesPage";

export default function ServerScreen() {
  const { id } = useLocalSearchParams();
  const control = Panel.getPanel();

  const navigation = useNavigation();
  const [sendConsolePerms, setSendConsolePerms] = useState(false);
  const [running, setRunning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  let serverSocket: PufferpanelSocket;

  useEffect(() => {
    navigation.addListener("beforeRemove", () => {
      serverSocket && serverSocket.close();
    });
  }, [navigation]);

  const consoleView = () => (
    <ConsoleView
      logs={logs}
      running={running}
      sendConsolePerms={sendConsolePerms}
    />
  );

  const mainRoute: BottomNavigationRoute = {
    key: "console",
    title: "Console",
    focusedIcon: "console-line"
  };
  const [routes, setRoutes] = useState<BottomNavigationRoute[]>([mainRoute]);
  const renderScene = BottomNavigation.SceneMap({
    console: consoleView,
    files: FilesPage,
    settings: ServerManagePage
  });

  useEffect(() => {
    control.get.server(id as string).then(({ permissions }) => {
      // First view stuff
      setSendConsolePerms(permissions.sendServerConsole);

      if (permissions.viewServerConsole) {
        serverSocket = control.getSocket(id as string);

        serverSocket.on("status", r => setRunning(r.running));
        serverSocket.on("console", l => setLogs(logs => logs.concat(l.logs)));
      } else {
        setLogs(["No logs :("]);
      }

      // Getting and setting the rest of the user permissions
      let newRoutes: BottomNavigationRoute[] = [mainRoute];
      permissions.viewServerFiles &&
        newRoutes.push({
          key: "files",
          title: "Files",
          focusedIcon: "folder"
        });

      permissions.editServerData &&
        newRoutes.push({
          key: "settings",
          title: "Manage",
          focusedIcon: "cog"
        });

      setRoutes(newRoutes);
    });
  }, []);

  return (
    <>
      <NameTab running={running} />

      <NavBar routes={routes} renderScene={renderScene} />
    </>
  );
}
