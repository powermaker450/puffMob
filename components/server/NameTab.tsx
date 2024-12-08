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

import Panel from "@/util/Panel";
import PufferpanelSocket from "@/util/PufferpanelSocket";
import haptic, { handleTouch } from "@/util/haptic";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Appbar,
  Button,
  Dialog,
  Icon,
  Portal,
  TextInput,
  Tooltip,
  useTheme
} from "react-native-paper";

const NameTab = () => {
  const { id } = useLocalSearchParams();
  const navigation = useNavigation();
  const theme = useTheme();
  const control = Panel.getPanel();
  let socket: PufferpanelSocket;

  const [running, setRunning] = useState(false);

  useEffect(() => {
    control.get.server(id as string).then(({ server, permissions }) => {
      setServerName(server.name);
      setNewName(server.name);

      setEditServer(permissions.editServerData);
      setStartPerms(permissions.startServer);
      setStopPerms(permissions.stopServer);

      if (permissions.viewServerConsole) {
        socket = control.getSocket(id as string);
        navigation.addListener("beforeRemove", () => socket && socket.close());

        socket.on("status", e => {
          setRunning(e.running);
        });
      }
    });
  }, []);

  const [serverName, setServerName] = useState("");
  const [newName, setNewName] = useState("");
  const changeNewName = (newText: string) => setNewName(newText);
  const [editServer, setEditServer] = useState(false);
  const openNameChange = () => {
    if (!editServer) {
      return;
    }

    haptic();
    setVisible(true);
  };
  const closeNameChange = () => {
    setVisible(false);
    setNewName(serverName);
  };

  const [startPerms, setStartPerms] = useState(false);
  const [stopPerms, setStopPerms] = useState(false);

  const [loading, setLoading] = useState(false);
  const startLoading = () => setLoading(true);
  const stopLoading = () => setLoading(false);
  const [nameUpdating, setNameUpdating] = useState(false);
  const [visible, setVisible] = useState(false);

  const handleErr = (err: any) =>
    console.warn("An unexpected error occured:", err);

  const handleStart = () => {
    startLoading();
    control.actions
      .start(id as string)
      .catch(handleErr)
      .finally(stopLoading);
  };

  const handleStop = () => {
    startLoading();
    control.actions
      .stop(id as string)
      .catch(handleErr)
      .finally(stopLoading);
  };

  const handleKill = () => {
    startLoading();
    control.actions
      .kill(id as string)
      .catch(handleErr)
      .finally(stopLoading);
  };

  const handleNameChange = () => {
    setNameUpdating(true);
    control.edit
      .serverName(id as string, newName)
      .then(() => {
        setServerName(newName);
        setNewName(newName);
        haptic("notificationSuccess");
      })
      .catch(handleErr)
      .finally(() => {
        setNameUpdating(false);
        closeNameChange();
      });
  };

  const loadingIcon = <ActivityIndicator animating={true} />;

  const startButton = (
    <Tooltip title="Start" enterTouchDelay={300} leaveTouchDelay={150}>
      <Appbar.Action
        icon="play-outline"
        onPress={handleStart}
        onPressIn={handleTouch}
        disabled={!startPerms}
      />
    </Tooltip>
  );

  const stopButton = (
    <Tooltip title="Stop" enterTouchDelay={300} leaveTouchDelay={150}>
      <Appbar.Action
        icon="stop"
        onPress={handleStop}
        onPressIn={handleTouch}
        disabled={!stopPerms}
      />
    </Tooltip>
  );

  const killButton = (
    <Tooltip title="Kill" enterTouchDelay={300} leaveTouchDelay={150}>
      <Appbar.Action
        icon="skull-outline"
        onPress={handleKill}
        onPressIn={handleTouch}
        disabled={!stopPerms}
      />
    </Tooltip>
  );

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction
          onPress={() => router.back()}
          onPressIn={handleTouch}
        />
        <Icon
          source="circle"
          size={12}
          color={running ? theme.colors.primary : theme.colors.surfaceDisabled}
        />
        <Appbar.Content
          style={{ marginLeft: 10 }}
          title={serverName}
          onPress={openNameChange}
          disabled={!editServer}
        />

        {loading ? loadingIcon : running ? stopButton : startButton}
        {!loading && running && killButton}
      </Appbar.Header>

      <Portal>
        <Dialog
          visible={visible}
          onDismiss={closeNameChange}
          dismissable={!nameUpdating}
        >
          <Dialog.Title>Edit Name</Dialog.Title>
          <Dialog.Content>
            <TextInput
              mode="outlined"
              label="Server Name"
              value={newName}
              onChangeText={changeNewName}
            />
          </Dialog.Content>
          <Dialog.Actions>
            {!nameUpdating && <Button onPress={closeNameChange}>Cancel</Button>}
            {nameUpdating ? (
              loadingIcon
            ) : (
              <Button
                onPressIn={handleTouch}
                onPress={handleNameChange}
                disabled={newName === serverName || !newName.trim()}
                mode="contained"
                style={{ paddingLeft: 10, paddingRight: 10 }}
              >
                Save
              </Button>
            )}
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
  );
};

export default NameTab;
