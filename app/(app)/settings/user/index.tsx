import User from "@/components/settings/User";
import Panel from "@/util/Panel";
import { handleTouch } from "@/util/haptic";
import { ModelsPermissionView, ModelsUserSearchResponse } from "@/util/models";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView } from "react-native";
import { Appbar } from "react-native-paper";

export default function users() {
  const control = Panel.getPanel();
  const [userList, setUserList] = useState<ModelsPermissionView[]>([]);
  const grabUsers = ({ users }: ModelsUserSearchResponse) => setUserList(users);

  useEffect(() => {
    control.get.users().then(grabUsers).catch(console.error);
  });

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPressIn={handleTouch} onPress={router.back} />
        <Appbar.Content title="Users" />
      </Appbar.Header>

      <ScrollView style={{ width: "95%", margin: "auto" }}>
        {userList.length
          ? userList.map(user => <User user={user} key={user.id} />)
          : null}
      </ScrollView>
    </>
  );
}
