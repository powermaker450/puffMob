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

import User from "@/components/settings/User";
import Panel from "@/util/Panel";
import haptic, { handleTouch } from "@/util/haptic";
import { ModelsPermissionView, ModelsUserSearchResponse } from "@/util/models";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView } from "react-native";
import { Appbar, FAB } from "react-native-paper";

export default function users() {
  const control = Panel.getPanel();
  const [userList, setUserList] = useState<ModelsPermissionView[]>([]);
  const grabUsers = ({ users }: ModelsUserSearchResponse) => setUserList(users);

  const styles: { scrollView: any; fab: any } = {
    scrollView: {
      width: "95%",
      margin: "auto"
    },
    fab: {
      position: "absolute",
      margin: 16,
      right: 0,
      bottom: 0
    }
  };

  useEffect(() => {
    control.get.users().then(grabUsers).catch(console.error);
  });

  const goToAdd = () => {
    haptic("contextClick");
    router.navigate("/settings/user/add");
  };

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPressIn={handleTouch} onPress={router.back} />
        <Appbar.Content title="Users" />
      </Appbar.Header>

      <ScrollView style={styles.scrollView}>
        {userList.length
          ? userList.map(user => <User user={user} key={user.id} />)
          : null}
      </ScrollView>

      <FAB icon="plus" style={styles.fab} onPress={goToAdd} />
    </>
  );
}
