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

import ButtonContainer from "@/components/ButtonContainer";
import Notice from "@/components/Notice";
import { usePanel } from "@/contexts/PanelProvider";
import haptic, { handleTouch } from "@/util/haptic";
import { ModelsPermissionView } from "@/util/models";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView } from "react-native";
import {
  ActivityIndicator,
  Appbar,
  Button,
  Checkbox,
  Dialog,
  List,
  Portal,
  Text,
  TextInput,
  useTheme
} from "react-native-paper";

export default function userById() {
  const { id } = useLocalSearchParams();
  const theme = useTheme();
  const { panel } = usePanel();
  const [header, setHeader] = useState("");

  const [user, setUser] = useState<ModelsPermissionView>();
  const [newUser, setNewUser] = useState<ModelsPermissionView>(user!);
  const toggleAdmin = () => {
    haptic(newUser.admin ? "contextClick" : "soft");
    setNewUser(v => ({ ...v, admin: !v.admin }));
  };
  const toggleViewServers = () => {
    haptic(newUser.viewServers ? "contextClick" : "soft");
    setNewUser(v => ({ ...v, viewServers: !v.viewServers }));
  };
  const toggleCreateServers = () => {
    haptic(newUser.createServers ? "contextClick" : "soft");
    setNewUser(v => ({ ...v, createServers: !v.createServers }));
  };
  const toggleDeleteServers = () => {
    haptic(newUser.deleteServers ? "contextClick" : "soft");
    setNewUser(v => ({ ...v, deleteServers: !v.deleteServers }));
  };
  const toggleEditServers = () => {
    haptic(newUser.editServerAdmin ? "contextClick" : "soft");
    setNewUser(v => ({ ...v, editServerAdmin: !v.editServerAdmin }));
  };
  const toggleViewNodes = () => {
    haptic(newUser.viewNodes ? "contextClick" : "soft");
    setNewUser(v => ({ ...v, viewNodes: !v.viewNodes }));
  };
  const toggleEditNodes = () => {
    haptic(newUser.editNodes ? "contextClick" : "soft");
    setNewUser(v => ({ ...v, editNodes: !v.editNodes }));
  };
  const toggleCreateNodes = () => {
    haptic(newUser.deployNodes ? "contextClick" : "soft");
    setNewUser(v => ({ ...v, deployNodes: !v.deployNodes }));
  };
  const togglePanelSettings = () => {
    haptic(newUser.panelSettings ? "contextClick" : "soft");
    setNewUser(v => ({ ...v, panelSettings: !v.panelSettings }));
  };
  const toggleViewTemplates = () => {
    haptic(newUser.viewTemplates ? "contextClick" : "soft");
    setNewUser(v => ({ ...v, viewTemplates: !v.viewTemplates }));
  };
  const toggleEditTemplates = () => {
    haptic(newUser.editTemplates ? "contextClick" : "soft");
    setNewUser(v => ({ ...v, editTemplates: !v.editTemplates }));
  };
  const toggleViewUsers = () => {
    haptic(newUser.viewUsers ? "contextClick" : "soft");
    setNewUser(v => ({ ...v, viewUsers: !v.viewUsers }));
  };
  const toggleEditUsers = () => {
    haptic(newUser.editUsers ? "contextClick" : "soft");
    setNewUser(v => ({ ...v, editUsers: !v.editUsers }));
  };

  const [notice, setNotice] = useState(false);
  const [noticeText, setNoticeText] = useState("");
  const resetNotice = () => {
    setNotice(false);
    setNoticeText("");
  };
  const detailsUpdateComplete = () => {
    setNotice(true);
    setNoticeText("Success!");
    setTimeout(resetNotice, 2000);
    haptic("notificationSuccess");
    setUser({ ...user!, email, username });
    setHeader(username);
  };
  const updateComplete = () => {
    setNotice(true);
    setNoticeText("Success!");
    setTimeout(resetNotice, 2000);
    haptic("notificationSuccess");
    setUser(newUser);
  };
  const deleteComplete = () => {
    router.back();
    haptic("notificationSuccess");
  };
  const handleErr = (err: any) => {
    setNotice(true);
    setNoticeText(`Error: ${err}`);
    setTimeout(resetNotice, 2000);
    haptic("notificationError");
    console.error(err);
  };

  // Used when confirming a user delete
  const [dialog, setDialog] = useState(false);
  const showDialog = () => setDialog(true);
  const hideDialog = () => setDialog(false);

  // Used when updating user data
  const [updating, setUpdating] = useState(false);
  const startUpdating = () => setUpdating(true);
  const stopUpdating = () => setUpdating(false);

  // New values, existing values are just in the user state
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const detailsChanged =
    (!username.match(/\s/) && username !== user?.username) ||
    (email.match(/[A-Za-z0-9].*@[A-Za-z0-9].*\.[A-Za-z0-9].*/) &&
      email !== user?.email) ||
    password;
  const isAdmin = updating || newUser ? newUser.admin : false;

  useEffect(() => {
    panel.get
      .userPerms(id as string)
      .then(user => {
        setUser(user);
        setNewUser(user);

        // Sometimes user.username is undefined. This might be a bug with Pufferpanel
        setUsername(user.username || "");
        setHeader(user.username);
        setEmail(user.email);
      })
      .catch(console.error);
  }, []);

  const styles: {
    view: any;
    accordion: any;
    input: any;
    button: any;
    icon: any;
  } = {
    view: {
      width: "95%",
      margin: "auto"
    },
    accordion: {
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: 20,
      marginTop: 7,
      marginBottom: 7
    },
    input: {
      width: "85%",
      margin: "auto",
      marginTop: 4,
      marginBottom: 4
    },
    button: {
      width: "80%",
      marginTop: 10,
      marginBottom: 10
    },
    icon: {
      marginLeft: 15
    }
  };

  const handleDetailsChange = () => {
    startUpdating();

    if (!user) {
      haptic("notificationError");
      return;
    }

    panel.edit
      .user(Number(id), { ...user, username, email, password })
      .then(detailsUpdateComplete)
      .catch(handleErr)
      .finally(stopUpdating);
  };

  const handlePermsChange = () => {
    startUpdating();

    if (!newUser) {
      haptic("notificationError");
      return;
    }

    panel.edit
      .userPerms(id as string, newUser)
      .then(updateComplete)
      .catch(handleErr)
      .finally(stopUpdating);
  };

  const handleDelete = () => {
    startUpdating();

    panel.delete
      .user(id as string)
      .then(deleteComplete)
      .catch(handleErr);
  };

  const loadingText = <ActivityIndicator animating />;
  const modalButtons = (
    <>
      <Button onPress={hideDialog}>Cancel</Button>

      <Button onPress={handleDelete} textColor={theme.colors.error}>
        Delete
      </Button>
    </>
  );

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPressIn={handleTouch} onPress={router.back} />
        <Appbar.Content title={header} />

        <Appbar.Action
          onPressIn={handleTouch}
          onPress={showDialog}
          icon="trash-can"
        />
      </Appbar.Header>

      <ScrollView style={styles.view}>
        <List.Accordion
          title="Details"
          left={() => <List.Icon icon="account-details" style={styles.icon} />}
          description="Username, email, and password reset"
          style={styles.accordion}
        >
          <TextInput
            mode="outlined"
            label="Username"
            style={styles.input}
            value={username}
            onChangeText={setUsername}
          />

          <TextInput
            mode="outlined"
            label="Email"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
          />

          <TextInput
            mode="outlined"
            label="New Password"
            style={styles.input}
            value={password}
            onChangeText={setPassword}
          />

          <ButtonContainer>
            <Button
              mode="contained"
              style={styles.button}
              disabled={updating || !detailsChanged}
              onPressIn={handleTouch}
              onPress={handleDetailsChange}
            >
              Save
            </Button>
          </ButtonContainer>
        </List.Accordion>

        <List.Accordion
          title="Permissions"
          description="Manage users access to the panel"
          left={() => <List.Icon icon="security" style={styles.icon} />}
          style={styles.accordion}
        >
          <List.Item
            title="Administrator"
            description="Grants all permissions listed below"
            onPress={toggleAdmin}
            right={() => (
              <Checkbox
                disabled={updating}
                status={newUser?.admin ? "checked" : "unchecked"}
              />
            )}
          />

          <List.Item
            title="View Servers"
            onPress={toggleViewServers}
            disabled={isAdmin}
            right={() => (
              <Checkbox
                disabled={isAdmin}
                status={newUser.viewServers ? "checked" : "unchecked"}
              />
            )}
          />

          <List.Item
            title="Create Servers"
            onPress={toggleCreateServers}
            disabled={isAdmin}
            right={() => (
              <Checkbox
                disabled={isAdmin}
                status={newUser.createServers ? "checked" : "unchecked"}
              />
            )}
          />

          <List.Item
            title="Delete Servers"
            onPress={toggleDeleteServers}
            disabled={isAdmin}
            right={() => (
              <Checkbox
                disabled={isAdmin}
                status={newUser.deleteServers ? "checked" : "unchecked"}
              />
            )}
          />

          <List.Item
            title="Edit Server Settings"
            onPress={toggleEditServers}
            disabled={isAdmin}
            right={() => (
              <Checkbox
                disabled={isAdmin}
                status={newUser.editServerAdmin ? "checked" : "unchecked"}
              />
            )}
          />

          <List.Item
            title="View Nodes"
            onPress={toggleViewNodes}
            disabled={isAdmin}
            right={() => (
              <Checkbox
                disabled={isAdmin}
                status={newUser.viewNodes ? "checked" : "unchecked"}
              />
            )}
          />

          <List.Item
            title="Edit Nodes"
            onPress={toggleEditNodes}
            disabled={isAdmin}
            right={() => (
              <Checkbox
                disabled={isAdmin}
                status={newUser.editNodes ? "checked" : "unchecked"}
              />
            )}
          />

          <List.Item
            title="Create Nodes"
            onPress={toggleCreateNodes}
            disabled={isAdmin}
            right={() => (
              <Checkbox
                disabled={isAdmin}
                status={newUser.deployNodes ? "checked" : "unchecked"}
              />
            )}
          />

          <List.Item
            title="Modify Panel Settings"
            onPress={togglePanelSettings}
            disabled={isAdmin}
            right={() => (
              <Checkbox
                disabled={isAdmin}
                status={newUser.panelSettings ? "checked" : "unchecked"}
              />
            )}
          />

          <List.Item
            title="View Templates"
            onPress={toggleViewTemplates}
            disabled={isAdmin}
            right={() => (
              <Checkbox
                disabled={isAdmin}
                status={newUser.viewTemplates ? "checked" : "unchecked"}
              />
            )}
          />

          <List.Item
            title="Edit Templates"
            onPress={toggleEditTemplates}
            disabled={isAdmin}
            right={() => (
              <Checkbox
                disabled={isAdmin}
                status={newUser.editTemplates ? "checked" : "unchecked"}
              />
            )}
          />

          <List.Item
            title="View All Users"
            onPress={toggleViewUsers}
            disabled={isAdmin}
            right={() => (
              <Checkbox
                disabled={isAdmin}
                status={newUser.viewUsers ? "checked" : "unchecked"}
              />
            )}
          />

          <List.Item
            title="Edit All Users"
            onPress={toggleEditUsers}
            disabled={isAdmin}
            right={() => (
              <Checkbox
                disabled={isAdmin}
                status={newUser.editUsers ? "checked" : "unchecked"}
              />
            )}
          />

          <ButtonContainer>
            <Button
              mode="contained"
              style={styles.button}
              disabled={updating}
              onPressIn={handleTouch}
              onPress={handlePermsChange}
            >
              Save
            </Button>
          </ButtonContainer>
        </List.Accordion>
      </ScrollView>

      <Portal>
        <Dialog visible={dialog} onDismiss={hideDialog}>
          <Dialog.Content>
            <Text variant="bodyMedium">
              Are you sure you want to delete{" "}
              <Text style={{ fontWeight: "bold" }}>
                {user?.username || user?.email}
              </Text>
              ?
            </Text>
          </Dialog.Content>

          <Dialog.Actions>
            {updating ? loadingText : modalButtons}
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Notice condition={notice} setCondition={setNotice} text={noticeText} />
    </>
  );
}
