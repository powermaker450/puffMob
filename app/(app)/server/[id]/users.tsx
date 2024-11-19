import CustomView from "@/components/CustomView";
import { Appbar, Text } from "react-native-paper";
import { router, useLocalSearchParams } from "expo-router";
import { handleTouch } from "@/util/haptic";
import { useEffect, useState } from "react";
import Panel from "@/util/Panel";
import { ModelsPermissionView } from "@/util/models";
import ManageUser from "@/components/ManageUser";
import { ScrollView } from "react-native";

export default function users() {
  const { id } = useLocalSearchParams();
  const panel = Panel.getPanel();

  const [userList, setUserList] = useState<ModelsPermissionView[]>([]);

  useEffect(() => {
    panel.get.serverUsers(id as string).then(users => setUserList(users));
  }, []);

  const noUsers = (
    <CustomView>
      <Text>You are all alone...</Text>
    </CustomView>
  );

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction
          onPressIn={handleTouch}
          onPress={() => router.back()}
        />
        <Appbar.Content title="Users" />
      </Appbar.Header>

      {!userList.length ? (
        noUsers
      ) : (
        <ScrollView style={{ width: "100%" }}>
          {userList.map((user, index) => {
            return <ManageUser user={user} key={index} />;
          })}
        </ScrollView>
      )}
    </>
  );
}
