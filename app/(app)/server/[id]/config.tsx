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

import Notice from "@/components/Notice";
import VariableView from "@/components/server/VariableView";
import haptic, { handleTouch } from "@/util/haptic";
import { ServerDataResponse } from "@/util/models";
import { router, useNavigation } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView } from "react-native";
import {
  ActivityIndicator,
  Appbar,
  Button,
  Dialog,
  FAB,
  Portal,
  Text,
  useTheme
} from "react-native-paper";
import { useServer } from "@/contexts/ServerProvider";

export default function config() {
  const theme = useTheme();
  const navigation = useNavigation();
  const { data } = useServer();
  const [serverData, setServerData] = useState<ServerDataResponse>();
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState(false);
  const [text, setText] = useState("");

  useEffect(() => {
    navigation.addListener("focus", () => {
      if (!data) {
        return;
      }
      const { server } = data;

      server.get.data().then(setServerData).catch(console.error);
    });
  }, []);

  const updateData = () => {
    if (!data) {
      return;
    }
    const { server } = data;

    setLoading(true);
    haptic();

    server.edit
      .data(serverData!)
      .then(() => {
        setText("Configuration saved!");
        haptic("notificationSuccess");
      })
      .catch(() => {
        setText("An error occured.");
        haptic("notificationError");
      })
      .finally(() => {
        setLoading(false);
        setNotice(true);
        setTimeout(() => {
          setNotice(false);
          setText("");
        }, 2000);
      });
  };

  const handleInstall = () => {
    if (!data) {
      return;
    }
    const { server } = data;

    setInstalling(true);
    server.actions
      .install()
      .then(() => {
        haptic("notificationSuccess");
        setText("Installed!");
        setNotice(true);
        setInstalling(false);
        setDialog(false);
        setTimeout(() => setNotice(false), 2000);
      })
      .catch(console.error);
  };

  const [dialog, setDialog] = useState(false);
  const [installing, setInstalling] = useState(false);

  const loadingText = <ActivityIndicator animating />;

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction
          onPressIn={handleTouch}
          onPress={() => router.back()}
        />
        <Appbar.Content title="Config" />

        <Appbar.Action
          icon="download"
          onPressIn={handleTouch}
          onPress={() => setDialog(true)}
        />
      </Appbar.Header>

      <Portal>
        <Dialog visible={dialog} onDismiss={() => setDialog(false)}>
          <Dialog.Content>
            <Text variant="bodyMedium">
              Installing the server will{" "}
              <Text style={{ fontWeight: "bold", color: theme.colors.error }}>
                overwrite
              </Text>{" "}
              config files and other data.
            </Text>
          </Dialog.Content>

          <Dialog.Actions>
            <Button onPressIn={handleTouch} onPress={() => setDialog(false)}>
              Cancel
            </Button>

            {installing ? (
              loadingText
            ) : (
              <Button onPressIn={handleTouch} onPress={handleInstall}>
                Install
              </Button>
            )}
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <ScrollView style={{ width: "90%", margin: "auto" }}>
        {!serverData
          ? loadingText
          : Object.keys(serverData.data).map(key => (
              <VariableView
                key={key}
                variableKey={key}
                variable={serverData.data[key]}
                res={serverData}
                setData={setServerData}
              />
            ))}
      </ScrollView>

      <FAB
        icon="check"
        disabled={loading}
        style={{ position: "absolute", bottom: 15, right: 15 }}
        onPress={updateData}
      />

      <Notice condition={notice} setCondition={setNotice} text={text} />
    </>
  );
}
