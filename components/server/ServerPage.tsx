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

import { ModelsServerView } from "@/util/models";
import { storage } from "@/util/storage";
import { useNavigation } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, View } from "react-native";
import { ActivityIndicator, Appbar } from "react-native-paper";
import Server from "../Server";
import { usePanel } from "@/contexts/PanelProvider";
import { useNotice } from "@/contexts/NoticeProvider";
import AuthenticationError from "@/util/AuthenticationError";
import PufferpanelError from "@/util/PufferpanelError";

export default function ServerPage() {
  const { panel, config, logout } = usePanel();
  const notice = useNotice();
  const navigation = useNavigation();

  const handleErr = (err: PufferpanelError | AuthenticationError | Error) => {
    notice.error(err.message);
    err instanceof AuthenticationError && logout();
  };
  const serverCache: ModelsServerView[] = JSON.parse(
    storage.getString("cachedServerList") ?? "[]"
  );
  const [serverList, setServerList] = useState<ModelsServerView[]>(serverCache);
  const [loading, setLoading] = useState(true);

  const refreshServerList = () =>
    panel.get
      .servers()
      .then(({ servers }) => {
        storage.set("cachedServerList", JSON.stringify(servers));
        setServerList(servers);
        setLoading(false);
      })
      .catch(handleErr);

  useEffect(() => {
    refreshServerList();
    navigation.addListener("focus", refreshServerList);
  }, []);

  const loadingIcon = (
    <ActivityIndicator
      animating={true}
      size="large"
      style={{ paddingTop: 30, paddingBottom: 30 }}
    />
  );

  return (
    <>
      <Appbar.Header>
        <Appbar.Content title={config.branding.name} />
      </Appbar.Header>

      <View
        style={{
          maxHeight: "85%",
          width: "100%",
          borderRadius: 20
        }}
      >
        <ScrollView>
          {!serverCache.length && loading
            ? loadingIcon
            : serverList.map(server => {
                return (
                  <Server
                    name={server.name}
                    id={server.id}
                    ip={server.ip}
                    port={server.port}
                    key={server.id}
                    node={server.node}
                    running={server.running}
                  />
                );
              })}
        </ScrollView>
      </View>
    </>
  );
}
