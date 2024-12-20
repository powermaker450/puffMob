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

import { useServer } from "@/contexts/ServerProvider";
import haptic, { handleTouch } from "@/util/haptic";
import { router } from "expo-router";
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
  const theme = useTheme();
  const { data } = useServer();

  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!data) {
      return;
    }
    const {
      server: { name, socket },
      permissions
    } = data;

    setServerName(name);
    permissions.viewServerConsole &&
      socket.on("status", e => setRunning(e.running));
  }, [data]);

  const startServer = data ? data.permissions.startServer : false;
  const stopServer = data ? data.permissions.stopServer : false;

  const [serverName, setServerName] = useState("");
  const [newName, setNewName] = useState("");
  const openNameChange = () => {
    if (data ? data.permissions.editServerData : false) {
      return;
    }

    haptic();
    setVisible(true);
  };
  const closeNameChange = () => {
    setVisible(false);
    setNewName(serverName);
  };

  const [loading, setLoading] = useState(false);
  const startLoading = () => setLoading(true);
  const stopLoading = () => setLoading(false);
  const [nameUpdating, setNameUpdating] = useState(false);
  const [visible, setVisible] = useState(false);

  const handleErr = (err: any) =>
    console.warn("An unexpected error occured:", err);

  const handleStart = () => {
    startLoading();
    data!.server.actions.start().catch(handleErr).finally(stopLoading);
  };

  const handleStop = () => {
    startLoading();
    data!.server.actions.stop().catch(handleErr).finally(stopLoading);
  };

  const handleKill = () => {
    startLoading();
    data!.server.actions.kill().catch(handleErr).finally(stopLoading);
  };

  const handleNameChange = () => {
    setNameUpdating(true);
    data!.server.edit
      .name(newName)
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
        disabled={!startServer}
      />
    </Tooltip>
  );

  const stopButton = (
    <Tooltip title="Stop" enterTouchDelay={300} leaveTouchDelay={150}>
      <Appbar.Action
        icon="stop"
        onPress={handleStop}
        onPressIn={handleTouch}
        disabled={!stopServer}
      />
    </Tooltip>
  );

  const killButton = (
    <Tooltip title="Kill" enterTouchDelay={300} leaveTouchDelay={150}>
      <Appbar.Action
        icon="skull-outline"
        onPress={handleKill}
        onPressIn={handleTouch}
        disabled={!(data ? data.permissions.stopServer : true)}
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
          disabled={data ? data.permissions.editServerData : false}
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
              onChangeText={setNewName}
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
