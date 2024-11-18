import Panel from "@/util/Panel";
import { useEffect, useState } from "react";
import { ScrollView } from "react-native";
import { List } from "react-native-paper";

interface ServerManagePageProps {
  id: string;
}

const ServerManagePage = ({ id }: ServerManagePageProps) => {
  const panel = Panel.getPanel();
  const [userPerms, setUserPerms] = useState(false);

  useEffect(() => {
    panel.get.server(id).then(({ permissions }) => {
      setUserPerms(permissions.editServerUsers);
    })
  }, []);

  return (
    <ScrollView contentContainerStyle={{ justifyContent: "center" }}>
      <List.Item
        title="Users"
        description="Manage users access to the server"
        style={{ display: userPerms ? "flex" : "none" }}
        left={() => <List.Icon icon="account-multiple-plus" style={{ marginLeft: 15 }} />}
      />
    </ScrollView>
  )
}

export default ServerManagePage;
