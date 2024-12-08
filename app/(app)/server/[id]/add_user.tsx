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
import Notice from "@/components/Notice";
import Panel from "@/util/Panel";
import haptic, { handleTouch } from "@/util/haptic";
import { NewServerUser } from "@/util/models";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, View } from "react-native";
import {
  Appbar,
  Button,
  Checkbox,
  List,
  Text,
  TextInput,
  useTheme
} from "react-native-paper";

export default function addUser() {
  const { id } = useLocalSearchParams();
  const theme = useTheme();
  const panel = Panel.getPanel();
  const [email, setEmail] = useState("");
  const changeEmail = (newEmail: string) => setEmail(newEmail);

  const [editServer, setEditServer] = useState(false);
  const [installServer, setInstallServer] = useState(false);
  const [viewConsole, setViewConsole] = useState(false);
  const [sendConsole, setSendConsole] = useState(false);
  const [stop, setStop] = useState(false);
  const [start, setStart] = useState(false);
  const [stats, setStats] = useState(false);
  const [sftp, setSftp] = useState(false);
  const [viewFiles, setViewFiles] = useState(false);
  const [editFiles, setEditFiles] = useState(false);
  const [editUsers, setEditUsers] = useState(false);

  const [loading, setLoading] = useState(false);

  const [notice, setNotice] = useState(false);

  let newUser: NewServerUser;

  useEffect(() => {
    newUser = {
      new: true,
      serverIdentifier: id as string,
      email: email,
      editServerData: editServer,
      installServer,
      viewServerConsole: viewConsole,
      sendServerConsole: sendConsole,
      stopServer: stop,
      startServer: start,
      viewServerStats: stats,
      sftpServer: sftp,
      viewServerFiles: viewFiles,
      putServerFiles: editFiles,
      editServerUsers: editUsers
    };
  }, [
    email,
    editServer,
    installServer,
    viewConsole,
    sendConsole,
    stop,
    start,
    stats,
    sftp,
    viewFiles,
    editFiles,
    editUsers
  ]);

  const addUser = () => {
    setLoading(true);

    panel.get.serverUsers(id as string).then(users => {
      for (const user of users) {
        if (user.email === email) {
          haptic("notificationError");

          setNotice(true);
          !notice && setTimeout(() => setNotice(false), 2000);

          setLoading(false);
          return;
        }
      }

      panel.create
        .serverUser(id as string, email, newUser)
        .then(() => {
          haptic("notificationSuccess");
          router.back();
        })
        .catch(() => haptic("notificationError"))
        .finally(() => setLoading(false));
    });
  };

  const centeredMargin: any = { width: "95%", margin: "auto" };
  const iconMargin = { marginLeft: 15 };
  const accordionStyle = {
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: 20
  };

  const innerAccordionStyle = {
    ...accordionStyle,
    ...centeredMargin,
    marginTop: 7,
    marginBottom: 7
  };

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction
          onPressIn={handleTouch}
          onPress={() => router.back()}
        />
        <Appbar.Content title="Add User" />
      </Appbar.Header>

      <CustomView>
        <View
          style={{
            height: "85%",
            borderRadius: 20,
            width: "85%"
          }}
        >
          <List.Section
            style={{ alignSelf: "center", width: "95%", marginBottom: 20 }}
          >
            <Text style={{ alignSelf: "center", marginBottom: 10 }}>Email</Text>
            <TextInput
              disabled={loading}
              style={{ width: "95%", margin: "auto" }}
              value={email}
              onChangeText={changeEmail}
            />
          </List.Section>

          <ScrollView
            style={{ maxHeight: "65%", width: "95%", alignSelf: "center" }}
          >
            <List.Section>
              <List.Accordion
                title="Server"
                description="General server configuration"
                left={() => <List.Icon icon="cog" style={iconMargin} />}
                style={{
                  marginTop: 14,
                  marginBottom: 7,
                  ...accordionStyle,
                  ...centeredMargin
                }}
              >
                <List.Item
                  title="Edit server config"
                  onPress={() => {
                    haptic(editServer ? "contextClick" : "soft");
                    setEditServer(!editServer);
                  }}
                  right={() => (
                    <Checkbox
                      status={editServer ? "checked" : "unchecked"}
                      disabled={loading}
                    />
                  )}
                  disabled={loading}
                  style={centeredMargin}
                />

                <List.Item
                  title="Install server"
                  onPress={() => {
                    haptic(installServer ? "contextClick" : "soft");
                    setInstallServer(!installServer);
                  }}
                  right={() => (
                    <Checkbox
                      status={installServer ? "checked" : "unchecked"}
                      disabled={loading}
                    />
                  )}
                  disabled={loading}
                  style={centeredMargin}
                />
              </List.Accordion>

              <List.Accordion
                title="Console"
                description="Server logs and command execution"
                left={() => (
                  <List.Icon icon="console-line" style={iconMargin} />
                )}
                style={{ width: "95%", margin: "auto", ...innerAccordionStyle }}
              >
                <List.Item
                  title="View console"
                  onPress={() => {
                    haptic(viewConsole ? "contextClick" : "soft");
                    setViewConsole(!viewConsole);
                  }}
                  right={() => (
                    <Checkbox
                      status={viewConsole ? "checked" : "unchecked"}
                      disabled={loading}
                    />
                  )}
                  disabled={loading}
                  style={centeredMargin}
                />

                <List.Item
                  title="Send commands"
                  onPress={() => {
                    haptic(sendConsole ? "contextClick" : "soft");
                    setSendConsole(!sendConsole);
                  }}
                  right={() => (
                    <Checkbox
                      status={sendConsole ? "checked" : "unchecked"}
                      disabled={loading}
                    />
                  )}
                  disabled={loading}
                  style={centeredMargin}
                />

                <List.Item
                  title="Start"
                  onPress={() => {
                    haptic(start ? "contextClick" : "soft");
                    setStart(!start);
                  }}
                  right={() => (
                    <Checkbox
                      status={start ? "checked" : "unchecked"}
                      disabled={loading}
                    />
                  )}
                  disabled={loading}
                  style={centeredMargin}
                />

                <List.Item
                  title="Stop & kill"
                  onPress={() => {
                    haptic(stop ? "contextClick" : "soft");
                    setStop(!stop);
                  }}
                  right={() => (
                    <Checkbox
                      status={stop ? "checked" : "unchecked"}
                      disabled={loading}
                    />
                  )}
                  disabled={loading}
                  style={centeredMargin}
                />
              </List.Accordion>

              <List.Accordion
                title="File system"
                description="Manipulation of the files on the server"
                left={() => <List.Icon icon="folder-cog" style={iconMargin} />}
                style={{ width: "95%", margin: "auto", ...innerAccordionStyle }}
              >
                <List.Item
                  title="SFTP Access"
                  onPress={() => {
                    haptic(sftp ? "contextClick" : "soft");
                    setSftp(!sftp);
                  }}
                  right={() => (
                    <Checkbox
                      status={sftp ? "checked" : "unchecked"}
                      disabled={loading}
                    />
                  )}
                  disabled={loading}
                  style={centeredMargin}
                />

                <List.Item
                  title="View and Download Files"
                  onPress={() => {
                    haptic(viewFiles ? "contextClick" : "soft");
                    setViewFiles(!viewFiles);
                  }}
                  right={() => (
                    <Checkbox
                      status={viewFiles ? "checked" : "unchecked"}
                      disabled={loading}
                    />
                  )}
                  disabled={loading}
                  style={centeredMargin}
                />

                <List.Item
                  title="Edit and Upload Files"
                  onPress={() => {
                    haptic(editFiles ? "contextClick" : "soft");
                    setEditFiles(!editFiles);
                  }}
                  right={() => (
                    <Checkbox
                      status={editFiles ? "checked" : "unchecked"}
                      disabled={loading}
                    />
                  )}
                  disabled={loading}
                  style={centeredMargin}
                />
              </List.Accordion>

              <List.Accordion
                title="Administrative"
                description="Administrative permissions"
                left={() => (
                  <List.Icon icon="server-security" style={iconMargin} />
                )}
                style={{ width: "95%", margin: "auto", ...innerAccordionStyle }}
              >
                <List.Item
                  title="View CPU/RAM Stats"
                  onPress={() => {
                    haptic(stats ? "contextClick" : "soft");
                    setStats(!stats);
                  }}
                  right={() => (
                    <Checkbox
                      status={stats ? "checked" : "unchecked"}
                      disabled={loading}
                    />
                  )}
                  disabled={loading}
                  style={centeredMargin}
                />

                <List.Item
                  title="Edit Users"
                  onPress={() => {
                    haptic(editUsers ? "contextClick" : "soft");
                    setEditUsers(!editUsers);
                  }}
                  right={() => (
                    <Checkbox
                      status={editFiles ? "checked" : "unchecked"}
                      disabled={loading}
                    />
                  )}
                  disabled={loading}
                  style={centeredMargin}
                />
              </List.Accordion>
            </List.Section>
          </ScrollView>

          <List.Section style={{ alignSelf: "center" }}>
            <Button
              style={{ margin: 5 }}
              mode="contained-tonal"
              disabled={loading}
              onPressIn={handleTouch}
              onPress={() => router.back()}
            >
              Cancel
            </Button>

            <Button
              style={{ margin: 5 }}
              mode="contained"
              disabled={
                !email.match(/[a-zA-Z0-9]*@[A-Za-z0-9]*\.[a-zA-Z0-9]*/) ||
                loading
              }
              onPressIn={handleTouch}
              onPress={addUser}
            >
              Save
            </Button>
          </List.Section>
        </View>
      </CustomView>

      <Notice
        condition={notice}
        setCondition={setNotice}
        text="That user already exists!"
      />
    </>
  );
}
