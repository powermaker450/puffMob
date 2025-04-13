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

import {
  ActivityIndicator,
  Appbar,
  Button,
  Dialog,
  Portal,
  Surface,
  Text,
  TextInput,
  useTheme
} from "react-native-paper";
import CustomView from "@/components/CustomView";
import { storage } from "@/util/storage";
import { router } from "expo-router";
import ButtonContainer from "@/components/ButtonContainer";
import { useState } from "react";
import haptic, { handleTouch } from "@/util/haptic";
import { PanelParams, UpdateUserParams } from "@/util/Panel";
import UnsavedChanges from "@/components/UnsavedChanges";
import { usePanel } from "@/contexts/PanelProvider";
import { useNotice } from "@/contexts/NoticeProvider";

export default function account() {
  const { panel, logout, settings, applyEmail, username, applyUsername } =
    usePanel();
  const notice = useNotice();

  const theme = useTheme();

  const buttonMargin = {
    marginTop: 20,
    marginBottom: 20,
    marginLeft: 5,
    marginRight: 5
  };
  const textInputMargin = {
    marginTop: 5,
    marginBottom: 5
  };

  const [logoutSplash, setLogoutSplash] = useState(false);
  const [loading, setLoading] = useState(false);

  const [newUsername, setNewUsername] = useState(username);
  const [newEmail, setNewEmail] = useState(settings.email);
  const [password, setPassword] = useState("");

  const reset = () => {
    setNewUsername(username);
    setNewEmail(settings.email);
    setPassword("");
  };

  const handleDetailsChange = () => {
    setLoading(true);
    const settings: PanelParams = JSON.parse(storage.getString("settings")!);
    let obj: UpdateUserParams;

    if (newUsername !== username && newEmail !== settings.email) {
      obj = { password, email: newEmail, username: newUsername };
    } else if (newUsername === username) {
      obj = { password, email: newEmail };
    } else {
      obj = { password, username: newUsername };
    }

    panel.edit
      .self(obj)
      .then(() => {
        notice.show("Saved!");

        if (newUsername !== username && newEmail !== settings.email) {
          applyUsername(newUsername);
          applyEmail(newEmail);
        } else if (newUsername === username) {
          applyEmail(newEmail);
          storage.set(
            "settings",
            JSON.stringify({
              password: settings.password,
              serverUrl: settings.serverUrl,
              email: newEmail
            })
          );
        } else {
          applyUsername(newUsername);
        }

        setPassword("");
      })
      .catch(() => {
        notice.error("Incorrect password.");
        haptic("notificationError");
      })
      .finally(() => setLoading(false));
  };

  const loadingIcon = (
    <ActivityIndicator
      animating
      size="large"
      style={{ marginTop: 15, marginBottom: 15 }}
    />
  );

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction
          onPressIn={handleTouch}
          onPress={() => router.back()}
          disabled={username !== newUsername || settings.email !== newEmail}
        />
        <Appbar.Content title="Account" />
      </Appbar.Header>

      <CustomView>
        <Portal>
          <Dialog
            visible={logoutSplash}
            onDismiss={() => setLogoutSplash(false)}
          >
            <Dialog.Title>
              <Text style={{ fontWeight: "bold" }}>Log out</Text>
            </Dialog.Title>
            <Dialog.Content>
              <Text>Are you sure you want to log out?</Text>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setLogoutSplash(false)}>Cancel</Button>
              <Button onPress={logout}>
                <Text
                  style={{ color: theme.colors.tertiary, fontWeight: "bold" }}
                >
                  Log out
                </Text>
              </Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>

        <Surface style={{ padding: 20, borderRadius: 20, width: "85%" }}>
          <Text
            style={{ marginTop: 15, marginBottom: 15, alignSelf: "center" }}
            variant="titleLarge"
          >
            Account Details
          </Text>

          <TextInput
            mode="outlined"
            style={textInputMargin}
            label="Username"
            value={newUsername}
            onChangeText={setNewUsername}
          />

          <TextInput
            mode="outlined"
            style={textInputMargin}
            label="Email"
            value={newEmail}
            onChangeText={setNewEmail}
            textContentType="emailAddress"
          />

          <TextInput
            mode="outlined"
            style={textInputMargin}
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            textContentType="password"
          />

          {loading ? (
            loadingIcon
          ) : (
            <Button
              mode="contained"
              onPressIn={handleTouch}
              onPress={handleDetailsChange}
              disabled={
                !password ||
                (username === newUsername && settings.email === newEmail)
              }
              style={{
                marginTop: 15,
                marginBottom: 15,
                width: "50%",
                alignSelf: "center"
              }}
            >
              Save
            </Button>
          )}
        </Surface>

        <ButtonContainer>
          <Button
            mode="contained"
            onPressIn={handleTouch}
            onPress={() => setLogoutSplash(true)}
            style={buttonMargin}
          >
            Log out
          </Button>
        </ButtonContainer>
      </CustomView>

      <UnsavedChanges
        condition={username !== newUsername || settings.email !== newEmail}
        reset={reset}
      />
    </>
  );
}
