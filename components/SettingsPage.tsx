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

import { Appbar, List, useTheme } from "react-native-paper";
import { router } from "expo-router";
import { ScrollView } from "react-native";
import { useEffect, useState } from "react";
import Panel from "@/util/Panel";

export default function SettingsPage() {
  const theme = useTheme();
  const [admin, setAdmin] = useState(false);
  const [editUsers, setEditUsers] = useState(false);

  useEffect(() => {
    Panel.getCachedScopes().forEach(scope => {
      switch (scope) {
        case "servers.admin":
          setAdmin(true);
          break;
        case "users.edit":
          setEditUsers(true);
        default: {
        }
      }
    });
  });

  return (
    <>
      <Appbar.Header>
        <Appbar.Content title="Settings" />
      </Appbar.Header>

      <ScrollView contentContainerStyle={{ justifyContent: "center" }}>
        <List.Item
          title="Panel Settings"
          description="Manage your Pufferpanel instance"
          style={{ display: admin ? "flex" : "none" }}
          onPress={() => router.navigate("/settings/panel_settings")}
          left={() => (
            <List.Icon icon="shield-edit" style={{ marginLeft: 15 }} />
          )}
        />

        <List.Item
          title="Users"
          description="Manage users access to the panel"
          style={{ display: admin || editUsers ? "flex" : "none" }}
          onPress={() => router.navigate("/settings/user")}
          left={() => (
            <List.Icon icon="account-multiple" style={{ marginLeft: 15 }} />
          )}
        />

        <List.Item
          title="Account"
          description="Manage account settings"
          onPress={() => router.navigate("/settings/account")}
          left={() => (
            <List.Icon icon="account-circle" style={{ marginLeft: 15 }} />
          )}
        />

        <List.Item
          title="Appearance"
          disabled
          description="Look and feel of the app"
          onPress={() => router.navigate("/settings/appearance")}
          left={() => (
            <List.Icon
              icon="palette"
              color={theme.colors.onSurfaceDisabled}
              style={{ marginLeft: 15 }}
            />
          )}
        />
      </ScrollView>
    </>
  );
}
