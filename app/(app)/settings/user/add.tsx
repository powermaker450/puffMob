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

import { useNotice } from "@/contexts/NoticeProvider";
import { usePanel } from "@/contexts/PanelProvider";
import haptic, { handleTouch } from "@/util/haptic";
import { NewUser, PufferpanelErrorResponse } from "@/util/models";
import { router } from "expo-router";
import { ComponentProps, useState } from "react";
import { ScrollView } from "react-native";
import {
  Appbar,
  Checkbox,
  FAB,
  List,
  TextInput,
  useTheme
} from "react-native-paper";

export default function add() {
  const theme = useTheme();
  const { panel } = usePanel();
  const notice = useNotice();

  const [updating, setUpdating] = useState(false);
  const startUpdating = () => setUpdating(true);
  const stopUpdating = () => setUpdating(false);

  const [newUser, setNewUser] = useState<NewUser>({
    username: "",
    email: "",
    password: ""
  });

  const { username, email, password } = newUser;

  const setUsername = (username: string) =>
    setNewUser(v => ({ ...v, username }));
  const setEmail = (email: string) => setNewUser(v => ({ ...v, email }));
  const setPassword = (password: string) =>
    setNewUser(v => ({ ...v, password }));

  const detailsChanged =
    !username.match(/\s/) &&
    username.length > 4 &&
    email.match(/[A-Za-z0-9].*@[A-Za-z0-9].*\.[A-Za-z0-9].*/) &&
    !!password;
  const isAdmin = updating || newUser ? newUser.admin : false;

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

  const styles: {
    view: ComponentProps<typeof ScrollView>["style"];
    accordion: ComponentProps<(typeof List)["Accordion"]>["style"];
    input: ComponentProps<typeof TextInput>["style"];
    icon: ComponentProps<(typeof List)["Icon"]>["style"];
    fab: ComponentProps<typeof FAB>["style"];
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
    icon: {
      marginLeft: 15
    },
    fab: {
      position: "absolute",
      margin: 16,
      right: 0,
      bottom: 0
    }
  };

  const handleSuccess = () => {
    notice.show(`${newUser.username} created!`);
    router.back();
  };

  const handleErr = (err: any) => {
    const { error }: PufferpanelErrorResponse = err;
    console.log(err);
    haptic("notificationError");
    notice.error(error.msg ?? `${error}`);
  };

  const handleAddUser = () => {
    startUpdating();

    panel.create
      .user(newUser)
      .then(handleSuccess)
      .catch(handleErr)
      .finally(stopUpdating);
  };

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPressIn={handleTouch} onPress={router.back} />
        <Appbar.Content title="Add User" />
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
            disabled={updating}
          />

          <TextInput
            mode="outlined"
            label="Email"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            disabled={updating}
          />

          <TextInput
            mode="outlined"
            label="New Password"
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            disabled={updating}
          />
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
        </List.Accordion>
      </ScrollView>

      <FAB
        icon="check"
        disabled={updating || !detailsChanged}
        style={styles.fab}
        onPress={handleAddUser}
      />
    </>
  );
}
