import Panel from "@/util/Panel";
import { useEffect, useState } from "react";
import { ScrollView } from "react-native";
import { List, useTheme } from "react-native-paper";

interface ServerManagePageProps {
  id: string;
}

const ServerManagePage = ({ id }: ServerManagePageProps) => {
  const theme = useTheme();

  const panel = Panel.getPanel();
  const [editPerms, setEditPerms] = useState(false);
  const [userPerms, setUserPerms] = useState(false);

  useEffect(() => {
    panel.get.server(id).then(({ permissions }) => {
      setEditPerms(permissions.editServerData);
      setUserPerms(permissions.editServerUsers);
    });
  }, []);

  return (
    <ScrollView contentContainerStyle={{ justifyContent: "center" }}>
      <List.Item
        title="Config"
        description="Edit the config for your server"
        style={{ display: editPerms ? "flex" : "none" }}
        disabled
        left={() => <List.Icon icon="file-code" style={{ marginLeft: 15 }} color={theme.colors.onSurfaceDisabled} />}
      />

      <List.Item
        title="Users"
        description="Manage users access to the server"
        style={{ display: userPerms ? "flex" : "none" }}
        disabled
        left={() => <List.Icon icon="account-multiple-plus" style={{ marginLeft: 15 }} color={theme.colors.onSurfaceDisabled} />}
      />

      <List.Item
        title="OAuth2 Clients"
        description="Manage all your OAuth2 clients for this server"
        disabled
        left={() => <List.Icon icon="server-security" style={{ marginLeft: 15 }} color={theme.colors.onSurfaceDisabled} />}
      >
      </List.Item>
    </ScrollView>
  )
}

export default ServerManagePage;
