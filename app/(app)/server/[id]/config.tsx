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

import UnsavedChanges from "@/components/UnsavedChanges";
import VariableView from "@/components/VariableView";
import Panel from "@/util/Panel";
import { handleTouch } from "@/util/haptic";
import { ServerDataResponse } from "@/util/models";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView } from "react-native";
import { ActivityIndicator, Appbar } from "react-native-paper";

export default function config() {
  const { id } = useLocalSearchParams();
  const navigation = useNavigation();
  const panel = Panel.getPanel();
  const [serverData, setServerData] = useState<ServerDataResponse>();

  useEffect(() => {
    navigation.addListener("focus", () => {
      panel.get.data(id as string).then(data => {
        setServerData(data);
      })
    })
  }, [navigation])

  const loading = <ActivityIndicator animating>Loading</ActivityIndicator>;

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPressIn={handleTouch} onPress={() => router.back()} />
        <Appbar.Content title="Config" />
      </Appbar.Header>

      <ScrollView style={{ width: "90%", margin: "auto" }}>
        {!serverData
          ? loading
          : Object.values(serverData.data).map((variable, index) => <VariableView key={index} variable={variable} />)
        }
      </ScrollView>
    </>
  );
}
