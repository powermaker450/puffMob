import CustomView from "@/components/CustomView";
import { Appbar, FAB, Text } from "react-native-paper";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import haptic, { handleTouch } from "@/util/haptic";
import { useEffect, useState } from "react";
import Panel from "@/util/Panel";
import { PermissionsUpdate } from "@/util/models";
import ManageUser from "@/components/ManageUser";
import { ScrollView } from "react-native";

export default function users() {
  const { id } = useLocalSearchParams();
  const navigation = useNavigation();
  const panel = Panel.getPanel();

  const [userList, setUserList] = useState<PermissionsUpdate[]>([]);
  const [removed, setRemoved] = useState(0);

  useEffect(() => {
    panel.get.serverUsers(id as string).then(users => setUserList(users));
  }, [removed]);

  useEffect(() => {
    navigation.addListener("focus", () => {
      panel.get.serverUsers(id as string).then(users => setUserList(users));
    });
  }, [navigation]);

  const noUsers = (
    <CustomView>
      <Text>You are all alone...</Text>
    </CustomView>
  );

  const addUser = () => {
    haptic();
    router.navigate(`/server/${id}/add_user`);
  };

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
            return (
              <ManageUser user={user} setRemoved={setRemoved} key={index} />
            );
          })}
        </ScrollView>
      )}

      <FAB
        icon="plus"
        onPress={addUser}
        style={{
          position: "absolute",
          bottom: 20,
          right: 20
        }}
      />
    </>
  );
}
