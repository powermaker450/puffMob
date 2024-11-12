import { Appbar, List, useTheme } from "react-native-paper";
import { router } from "expo-router";
import { ScrollView } from "react-native";
import { useEffect, useState } from "react";
import { storage } from "@/util/storage";
import Panel from "@/util/Panel";

export default function SettingsPage() {
  const theme = useTheme();
  const [admin, setAdmin] = useState(false);

  useEffect(() => {
    const settings = JSON.parse(storage.getString("settings")!);
    const panel = new Panel(settings);

    panel.getScopes().then(scopes => {
      for (const scope of scopes) {
        switch (scope) {
          case "servers.admin":
            setAdmin(true);
            break;
          default:
            {}
        }
      }
    })
  })

  return (
    <>
      <Appbar.Header>
        <Appbar.Content title="Settings" />
      </Appbar.Header>

      <ScrollView
        contentContainerStyle={{ marginLeft: 15, justifyContent: "center" }}
      >
        <List.Item
          title="Panel Settings"
          description="Manage your Pufferpanel instance"
          style={{ display: admin ? "flex" : "none" }}
          onPress={() => console.log("admin")}
          left={() => <List.Icon icon="shield-edit" />}
        />

        <List.Item
          title="Account"
          description="Manage account settings"
          onPress={() => router.navigate("/settings/account")}
          left={() => <List.Icon icon="account-circle" />}
        />

        <List.Item
          title="Appearance"
          disabled
          description="Look and feel of the app"
          onPress={() => router.navigate("/settings/appearance")}
          left={() => <List.Icon icon="palette" color={theme.colors.onSurfaceDisabled} />}
        />
      </ScrollView>
    </>
  );
}
