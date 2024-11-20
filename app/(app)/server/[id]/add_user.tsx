import CustomView from "@/components/CustomView";
import Panel from "@/util/Panel";
import haptic, { handleTouch } from "@/util/haptic";
import { NewServerUser } from "@/util/models";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { ScrollView } from "react-native";
import { Appbar, Button, Card, Checkbox, Icon, List, Text, TextInput, useTheme } from "react-native-paper";

export default function addUser() {
  const { id } = useLocalSearchParams();
  const theme = useTheme();
  const panel = Panel.getPanel();
  const [email, setEmail] = useState("");

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

  let newUser: NewServerUser = {
    email: "",
    new: true,
    serverIdentifier: id as string,
    editServerData: false,
    editServerUsers: false,
    installServer: false,
    putServerFiles: false,
    sendServerConsole: false,
    sftpServer: false,
    startServer: false,
    stopServer: false,
    viewServerConsole: false,
    viewServerFiles: false,
    viewServerStats: false
  };

  const addUser = () => {
    setLoading(true);
    panel.create.serverUser(id as string, email, newUser)
      .then(() => {
        haptic("notificationSuccess");
        router.back();
      })
      .catch(() => haptic("notificationError"))
      .finally(() => setLoading(false));
  }

  const centeredMargin: any = { width: "95%", margin: "auto" };
  const iconMargin = { marginLeft: 15 };
  const accordionStyle = {
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: 20
  };

  const innerAccordionStyle = { ...accordionStyle, ...centeredMargin, marginTop: 7, marginBottom: 7 };

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPressIn={handleTouch} onPress={() => router.back()} />
        <Appbar.Content title="Add User" />
      </Appbar.Header>

      <CustomView>
        <Card
          contentStyle={{
            flex: 1,
            alignContent: "center",
            justifyContent: "center",
          }}
          style={{
            height: "85%",
            borderRadius: 20,
            backgroundColor: theme.colors.surface,
            width: "85%"
          }}
        >
          <Text
            style={{ marginTop: 30, marginBottom: 30, alignSelf: "center" }}
            variant="titleLarge"
          >
            Add a user
          </Text>

          <List.Section
            style={{ alignSelf: "center", width: "95%", marginBottom: 20 }}
          >
            <Text style={{ alignSelf: "center", marginBottom: 10 }} >Email</Text>
            <TextInput disabled={loading} style={{ width: "95%", margin: "auto" }} value={email} onChangeText={newText => {
                setEmail(newText);
                newUser.email = email;
              }}
            />
          </List.Section>

          <ScrollView style={{ maxHeight: "65%", width: "95%", alignSelf: "center" }}>
            <List.Section>
              <List.Accordion
                title="Server"
                description="General server configuration"
                left={() => <List.Icon icon="cog" style={iconMargin} />}
                style={{ marginTop: 14, marginBottom: 7, ...accordionStyle, ...centeredMargin}}
              >
                <List.Item
                  title="Edit server config"
                  onPress={() => {
                    haptic(editServer ? "contextClick" : "soft");
                    setEditServer(!editServer);
                    newUser.editServerData = !newUser.editServerData;
                  }}
                  right={() => (
                    <Checkbox status={editServer ? "checked" : "unchecked"} disabled={loading} />
                  )}
                  disabled={loading}
                  style={centeredMargin}
                />

                <List.Item
                  title="Install server"
                  onPress={() => {
                    haptic(installServer ? "contextClick" : "soft");
                    setInstallServer(!installServer);
                    newUser.installServer = !newUser.installServer;
                  }}
                  right={() => (
                    <Checkbox status={installServer ? "checked" : "unchecked"} disabled={loading} />
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
                    setViewConsole(!viewConsole);
                    newUser.viewServerConsole = !newUser.viewServerConsole;
                  }}
                  right={() => (
                    <Checkbox status={viewConsole ? "checked" : "unchecked"} disabled={loading} />
                  )}
                  disabled={loading}
                  style={centeredMargin}
                />

                <List.Item
                  title="Send commands"
                  onPress={() => {
                    haptic(sendConsole ? "contextClick" : "soft");
                    setSendConsole(!sendConsole);
                    newUser.sendServerConsole = !newUser.sendServerConsole;
                  }}
                  right={() => (
                    <Checkbox status={sendConsole ? "checked" : "unchecked"} disabled={loading} />
                  )}
                  disabled={loading}
                  style={centeredMargin}
                />

                <List.Item
                  title="Start"
                  onPress={() => {
                    haptic(start ? "contextClick" : "soft");
                    setStart(!start);
                    newUser.startServer = !newUser.startServer;
                  }}
                  right={() => <Checkbox status={start ? "checked" : "unchecked"} disabled={loading} />}
                  disabled={loading}
                  style={centeredMargin}
                />

                <List.Item
                  title="Stop & kill"
                  onPress={() => {
                    haptic(stop ? "contextClick" : "soft");
                    setStop(!stop);
                    newUser.stopServer = !newUser.stopServer;
                  }}
                  right={() => <Checkbox status={stop ? "checked" : "unchecked"} disabled={loading} />}
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
                    newUser.sftpServer = !newUser.sftpServer;
                  }}
                  right={() => <Checkbox status={sftp ? "checked" : "unchecked"} disabled={loading} />}
                  disabled={loading}
                  style={centeredMargin}
                />

                <List.Item
                  title="View and Download Files"
                  onPress={() => {
                    haptic(viewFiles ? "contextClick" : "soft");
                    setViewFiles(!viewFiles);
                    newUser.viewServerFiles = !newUser.viewServerFiles;
                  }}
                  right={() => (
                    <Checkbox status={viewFiles ? "checked" : "unchecked"} disabled={loading} />
                  )}
                  disabled={loading}
                  style={centeredMargin}
                />

                <List.Item
                  title="Edit and Upload Files"
                  onPress={() => {
                    haptic(editFiles ? "contextClick" : "soft");
                    setEditFiles(!editFiles);
                    newUser.putServerFiles = !newUser.putServerFiles;
                  }}
                  right={() => (
                    <Checkbox status={editFiles ? "checked" : "unchecked"} disabled={loading} />
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
                    setStats(!stats);
                    newUser.viewServerStats = !newUser.viewServerStats;
                  }}
                  right={() => <Checkbox status={stats ? "checked" : "unchecked"} disabled={loading} />}
                  disabled={loading}
                  style={centeredMargin}
                />

                <List.Item
                  title="Edit Users"
                  onPress={() => {
                    haptic(editUsers ? "contextClick" : "soft");
                    setEditUsers(!editUsers);
                    newUser.editServerUsers = !newUser.editServerUsers;
                  }}
                  right={() => (
                    <Checkbox status={editFiles ? "checked" : "unchecked"} disabled={loading} />
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
              disabled={loading}
              onPressIn={handleTouch}
              onPress={addUser}
            >
              Save
            </Button>
          </List.Section>
        </Card>
      </CustomView>
    </>
  );
}
