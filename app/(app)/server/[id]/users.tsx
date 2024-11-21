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
