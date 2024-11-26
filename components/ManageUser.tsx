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
import haptic, { handleTouch } from "@/util/haptic";
import { PermissionsUpdate } from "@/util/models";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  Button,
  Checkbox,
  Dialog,
  List,
  Portal,
  Text,
  useTheme
} from "react-native-paper";

interface ManageUserProps {
  user: PermissionsUpdate;
  setRemoved: React.Dispatch<React.SetStateAction<number>>;
}

// Lets not destructure the user because then I'd have to destructure all their permissions
const ManageUser = ({ user, setRemoved }: ManageUserProps) => {
  const { id } = useLocalSearchParams();
  const theme = useTheme();
  const panel = Panel.getPanel();
  let updatedUser = user;

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

  useEffect(() => {
    setEditServer(user.editServerData);
    setInstallServer(user.installServer);
    setViewConsole(user.viewServerConsole);
    setSendConsole(user.sendServerConsole);
    setStop(user.stopServer);
    setStart(user.startServer);
    setStats(user.viewServerStats);
    setSftp(user.sftpServer);
    setViewFiles(user.viewServerFiles);
    setEditFiles(user.putServerFiles);
  }, []);

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

  const editPerms = () => {
    setLoading(true);
    const { email } = user;

    panel.edit
      .serverUser(id as string, email, updatedUser)
      .finally(() => setLoading(false));
  };

  const [dialog, setDialog] = useState(false);
  const openDialog = () => {
    haptic();
    setDialog(true);
  };

  const deleteUser = () => {
    setLoading(true);
    setDialog(false);
    panel.delete
      .serverUser(user.serverIdentifier, user.email)
      .then(() => {
        setRemoved(Math.random());
        haptic("notificationSuccess");
      })
      .catch(() => haptic("notificationError"))
      .finally(() => setLoading(false));
  };

  return (
    <>
      <List.Section style={centeredMargin}>
        <List.Accordion
          title={user.username}
          style={accordionStyle}
          onLongPress={openDialog}
          delayLongPress={300}
          left={() => <List.Icon icon="account" style={iconMargin} />}
        >
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
                updatedUser.editServerData = !updatedUser.editServerData;
                setEditServer(!editServer);
                editPerms();
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
                updatedUser.installServer = !updatedUser.installServer;
                setInstallServer(!installServer);
                editPerms();
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
            left={() => <List.Icon icon="console-line" style={iconMargin} />}
            style={{ width: "95%", margin: "auto", ...innerAccordionStyle }}
          >
            <List.Item
              title="View console"
              onPress={() => {
                haptic(viewConsole ? "contextClick" : "soft");
                updatedUser.viewServerConsole = !updatedUser.viewServerConsole;
                setViewConsole(!viewConsole);
                editPerms();
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
                updatedUser.sendServerConsole = !updatedUser.sendServerConsole;
                setSendConsole(!sendConsole);
                editPerms();
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
                updatedUser.startServer = !updatedUser.startServer;
                setStart(!start);
                editPerms();
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
                updatedUser.stopServer = !updatedUser.stopServer;
                setStop(!stop);
                editPerms();
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
                updatedUser.sftpServer = !updatedUser.sftpServer;
                setSftp(!sftp);
                editPerms();
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
                updatedUser.viewServerFiles = !updatedUser.viewServerFiles;
                setViewFiles(!viewFiles);
                editPerms();
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
                updatedUser.putServerFiles = !updatedUser.putServerFiles;
                setEditFiles(!editFiles);
                editPerms();
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
            left={() => <List.Icon icon="server-security" style={iconMargin} />}
            style={{ width: "95%", margin: "auto", ...innerAccordionStyle }}
          >
            <List.Item
              title="View CPU/RAM Stats"
              onPress={() => {
                haptic(stats ? "contextClick" : "soft");
                updatedUser.viewServerStats = !updatedUser.viewServerStats;
                setStats(!stats);
                editPerms();
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
                updatedUser.editServerUsers = !updatedUser.editServerUsers;
                setEditUsers(!editUsers);
                editPerms();
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
        </List.Accordion>
      </List.Section>

      <Portal>
        <Dialog visible={dialog} onDismiss={() => setDialog(false)}>
          <Dialog.Content><Text variant="bodyMedium">Remove this user?</Text></Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialog(false)}>Cancel</Button>
            <Button
              onPress={deleteUser}
              onPressIn={handleTouch}
            >
              <Text style={{ color: theme.colors.error, fontWeight: "bold" }}>Remove</Text>
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
  );
};

export default ManageUser;
