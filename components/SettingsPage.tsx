import { Appbar, List } from "react-native-paper";
import { router } from "expo-router";
import { ScrollView } from "react-native";

export default function SettingsPage() {
  return (
    <>
      <Appbar.Header>
        <Appbar.Content title="Settings" />
      </Appbar.Header>

      <ScrollView
        contentContainerStyle={{ marginLeft: 15, justifyContent: "center" }}
      >
        <List.Item
          title="Account"
          description="Manage account settings"
          onPress={() => router.navigate("/settings/account")}
          left={() => <List.Icon icon="account-circle" />}
        />

        <List.Item
          title="Appearance"
          description="Look and feel of the app"
          onPress={() => router.navigate("/settings/appearance")}
          left={() => <List.Icon icon="palette" />}
        />
      </ScrollView>
    </>
  );
}
