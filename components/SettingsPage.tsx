import { Appbar, List, useTheme } from "react-native-paper";
import { router } from "expo-router";
import { ScrollView } from "react-native";
import { useEffect, useState } from "react";
import Panel from "@/util/Panel";

export default function SettingsPage() {
  const theme = useTheme();
  const [admin, setAdmin] = useState(false);

  useEffect(() => {
    Panel.getCachedScopes().forEach(scope => {
      switch (scope) {
        case "servers.admin":
          setAdmin(true);
          break;
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
