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
import LoadingAnimation from "@/components/LoadingAnimation";
import OAuthClient from "@/components/settings/OAuthClient";
import { usePanel } from "@/contexts/PanelProvider";
import haptic, { handleTouch } from "@/util/haptic";
import { ModelsClient } from "@/util/models";
import { router, useNavigation } from "expo-router";
import { ComponentProps, useEffect, useState } from "react";
import { ScrollView } from "react-native";
import { Appbar, FAB, Text } from "react-native-paper";

export default function oauth() {
  const { panel } = usePanel();
  const navigation = useNavigation();

  const [loading, setLoading] = useState(true);
  const stopLoading = () => setLoading(false);
  const [clients, setClients] = useState<ModelsClient[]>([]);
  const grabClients = (clients: ModelsClient[]) => {
    setClients(clients);
    stopLoading();
  };
  const [refresh, setRefresh] = useState(0);
  const execRefresh = () => setRefresh(Math.random());

  useEffect(
    () => void panel.get.selfOauth2().then(grabClients).catch(console.error),
    [refresh]
  );
  useEffect(() => navigation.addListener("focus", execRefresh), []);

  const noClients = (
    <CustomView>
      <Text variant="bodyLarge">You are all alone...</Text>
    </CustomView>
  );

  const styles: { fab: ComponentProps<typeof FAB>["style"] } = {
    fab: {
      position: "absolute",
      bottom: 0,
      right: 0,
      margin: 20
    }
  };

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPressIn={handleTouch} onPress={router.back} />
        <Appbar.Content title="OAuth2 Clients" />
      </Appbar.Header>

      <ScrollView style={{ width: "100%", margin: "auto" }}>
        {loading && LoadingAnimation}
        {clients.length
          ? clients.map(client => (
              <OAuthClient
                key={client.client_id}
                client={client}
                refresh={execRefresh}
              />
            ))
          : noClients}
      </ScrollView>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => {
          haptic();
          router.navigate(`/settings/oauth/add`);
        }}
      />
    </>
  );
}
