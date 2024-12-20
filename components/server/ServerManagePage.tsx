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

import { useServer } from "@/contexts/ServerProvider";
import { router, useLocalSearchParams } from "expo-router";
import { ScrollView } from "react-native";
import { List } from "react-native-paper";

const ServerManagePage = () => {
  const { id } = useLocalSearchParams();
  const { data } = useServer();

  return (
    <ScrollView contentContainerStyle={{ justifyContent: "center" }}>
      <List.Item
        title="Config"
        description="Edit the config for your server"
        onPress={() => router.navigate(`/server/${id}/config`)}
        style={{
          display: (data ? data.permissions.editServerData : false)
            ? "flex"
            : "none"
        }}
        left={() => <List.Icon icon="file-code" style={{ marginLeft: 15 }} />}
      />

      <List.Item
        title="Users"
        description="Manage users access to the server"
        onPress={() => router.navigate(`/server/${id}/users`)}
        style={{
          display: (data ? data.permissions.editServerUsers : false)
            ? "flex"
            : "none"
        }}
        left={() => (
          <List.Icon icon="account-multiple-plus" style={{ marginLeft: 15 }} />
        )}
      />

      <List.Item
        title="OAuth2 Clients"
        description="Manage all your OAuth2 clients for this server"
        onPress={() => router.navigate(`/server/${id}/oauth`)}
        left={() => (
          <List.Icon icon="server-security" style={{ marginLeft: 15 }} />
        )}
      ></List.Item>
    </ScrollView>
  );
};

export default ServerManagePage;
