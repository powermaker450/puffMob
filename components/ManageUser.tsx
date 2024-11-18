import Panel from "@/util/Panel";
import haptic from "@/util/haptic";
import { ModelsPermissionView } from "@/util/models"
import { useEffect, useState } from "react";
import { Checkbox, List, useTheme } from "react-native-paper"

interface ManageUserProps {
  user: ModelsPermissionView;
}

// Lets not destructure the user because then I'd have to destructure all their permissions
const ManageUser = ({ user }: ManageUserProps) => {
  const theme = useTheme();
  const panel = Panel.getPanel();

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

  const iconMargin = { marginLeft: 15 };
  const accordionStyle = { backgroundColor: theme.colors.surfaceVariant, borderRadius: 20 };

  const editPerms = () => {
    console.log("Edited permissions");
  }

  return (
    <List.Section style={{ width: "95%", margin: "auto" }}>
      <List.Accordion
        title={user.username}
        style={accordionStyle}
      >
        <List.Accordion
          title="Server"
          description="General server configuration"
          left={() => <List.Icon icon="cog" style={iconMargin} />}
        >
          <List.Item
            title="Edit server config"
            onPress={() => {
              haptic(editServer ? "contextClick" : "soft");
              setEditServer(!editServer);
              editPerms();
            }}
            right={() => <Checkbox
              status={editServer ? "checked" : "unchecked"}
            />}
          />

          <List.Item
            title="Install server"
            onPress={() => {
              haptic(installServer ? "contextClick" : "soft");
              setInstallServer(!installServer);
              editPerms();
            }}
            right={() => <Checkbox status={installServer ? "checked" : "unchecked"} />}
          />
        </List.Accordion>

        <List.Accordion
          title="Console"
          description="Server logs and command execution"
          left={() => <List.Icon icon="console-line" style={iconMargin} />}
        >
          <List.Item
            title="View console"
            onPress={() => {
              haptic(viewConsole ? "contextClick" : "soft");
              setViewConsole(!viewConsole);
              editPerms();
            }}
            right={() => <Checkbox status={viewConsole ? "checked" : "unchecked"} />}
          />

          <List.Item
            title="Send commands"
            onPress={() => {
              haptic(sendConsole ? "contextClick" : "soft");
              setSendConsole(!sendConsole);
              editPerms();
            }}
            right={() => <Checkbox status={sendConsole ? "checked" : "unchecked"} />}
          />

          <List.Item
            title="Start"
            onPress={() => {
              haptic(start ? "contextClick" : "soft");
              setStart(!start);
              editPerms();
            }}
            right={() => <Checkbox status={start ? "checked" : "unchecked"} />}
          />

          <List.Item
            title="Stop & kill"
            onPress={() => {
              haptic(stop ? "contextClick" : "soft");
              setStop(!stop);
              editPerms();
            }}
            right={() => <Checkbox status={stop ? "checked" : "unchecked"} />}
          />
        </List.Accordion>

        <List.Accordion
          title="File system"
          description="Manipulation of the files on the server"
          left={() => <List.Icon icon="folder-cog" style={iconMargin} />}
        >
          <List.Item
            title="SFTP Access"
            onPress={() => {
              haptic(sftp ? "contextClick" : "soft");
              setSftp(!sftp);
              editPerms();
            }}
            right={() => <Checkbox status={sftp ? "checked" : "unchecked"} />}
          />

          <List.Item
            title="View and Download Files"
            onPress={() => {
              haptic(viewFiles ? "contextClick" : "soft");
              setViewFiles(!viewFiles);
              editPerms();
            }}
            right={() => <Checkbox status={viewFiles ? "checked" : "unchecked"} />}
          />

          <List.Item
            title="Edit and Upload Files"
            onPress={() => {
              haptic(editFiles ? "contextClick" : "soft");
              setEditFiles(!editFiles);
              editPerms();
            }}
            right={() => <Checkbox status={editFiles ? "checked" : "unchecked"} />}
          />
        </List.Accordion>

        <List.Accordion
          title="Administrative"
          description="Administrative permissions"
          left={() => <List.Icon icon="server-security" style={iconMargin} />}
        >
          <List.Item
            title="View CPU/RAM Stats"
            onPress={() => {
              haptic(stats ? "contextClick" : "soft");
              setStats(!stats);
              editPerms();
            }}
            right={() => <Checkbox status={stats ? "checked" : "unchecked"} />}
          />

          <List.Item
            title="Edit Users"
            onPress={() => {
              haptic(editUsers ? "contextClick" : "soft");
              setEditUsers(!editUsers);
              editPerms();
            }}
            right={() => <Checkbox status={editFiles ? "checked" : "unchecked"} />}
          />
        </List.Accordion>
      </List.Accordion>
    </List.Section>
  )
}

export default ManageUser
