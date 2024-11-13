import CustomView from "@/components/CustomView";
import Panel, { PanelParams } from "@/util/Panel";
import { storage } from "@/util/storage";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Appbar,
  Icon,
  Text,
  Tooltip,
  TextInput,
  useTheme,
  Surface,
  Dialog,
  Portal,
  Button,
  Snackbar
} from "react-native-paper";
import { ScrollView, View } from "react-native";
import haptic, { handleTouch } from "@/util/haptic";

export default function ServerScreen() {
  const settings: PanelParams = JSON.parse(storage.getString("settings")!);
  const control = new Panel(settings);
  const theme = useTheme();

  const { id } = useLocalSearchParams();
  const navigation = useNavigation();
  const [serverName, setServerName] = useState("");
  const [newName, setNewName] = useState("");
  const [consolePerms, setConsolePerms] = useState(false);

  const serverSocket = control.getSocket(id as string);

  useEffect(() => {
    navigation.addListener("beforeRemove", () => {
      serverSocket.close();
    });
  }, [navigation]);

  useEffect(() => {
    control.get.server(id as string).then(({ server, permissions }) => {
      setServerName(server.name);
      setNewName(server.name);

      switch (true) {
        case permissions.sendServerConsole:
          setConsolePerms(true);
        default:
          {}
      }
    });

    serverSocket.onopen = () => {
      console.log("Connected to server websocket");
      serverSocket.send(JSON.stringify({ type: "replay", since: 0 }));
      serverSocket.send(JSON.stringify({ type: "status" }));

      const interval = setInterval(() => {
        serverSocket.send(JSON.stringify({ type: "status" }));
        console.log("Sent keepalive");
      }, 45_000);

      serverSocket.onclose = m => {
        console.log("Socket closed:", m.code, m.reason);
        clearInterval(interval);
        console.log("Killed keepalive");
      };
    };

    serverSocket.addEventListener("message", e => {
      const packet = JSON.parse(e.data);

      if (packet.type !== "console" || !packet.data) {
        return;
      }

      let newLogs = "";
      for (const line of Object.values(packet.data.logs)) {
        newLogs += line;
      }

      setLogs(
        logs =>
          logs +
          newLogs.replace(
            /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
            ""
          )
      );
    });

    serverSocket.addEventListener("message", e => {
      const packet = JSON.parse(e.data);

      if (packet.type !== "status") {
        return;
      }

      setRunning(packet.data.running);
    });
  }, []);

  const [running, setRunning] = useState<boolean | undefined>(false);
  const [loading, setLoading] = useState(false);
  const [command, setCommand] = useState("");
  const [logs, setLogs] = useState("");
  const [nameUpdating, setNameUpdating] = useState(false);
  const [notice, setNotice] = useState(false);
  const [visible, setVisible] = useState(false);
  const openNameChange = () => {
    haptic();
    setVisible(true);
  };
  const closeNameChange = () => {
    setVisible(false);
    setNewName(serverName);
  };

  const handleStart = () => {
    setLoading(true);
    control.get
      .server(id as string)
      .then(({ server }) => server.actions.start())
      .catch(err => console.warn("An unexpected error occured:", err))
      .finally(() => {
        setRunning(true);
        setLoading(false);
      });
  };

  const handleStop = () => {
    setLoading(true);
    control.get
      .server(id as string)
      .then(({ server }) => server.actions.stop())
      .catch(err => console.warn("An unexpected error occured:", err))
      .finally(() => {
        setLoading(false);
      });
  };

  const handleKill = () => {
    setLoading(true);
    control.get
      .server(id as string)
      .then(({ server }) => server.actions.kill())
      .catch(err => console.warn("An unexpected error occured:", err))
      .finally(() => {
        setLoading(false);
      });
  };

  const handleNameChange = () => {
    setNameUpdating(true);
    control.get
      .server(id as string)
      .then(({ server }) => {
        server.edit.name(newName).then(() => {
          setServerName(newName);
          setNewName(newName);
          haptic("notificationSuccess");
          setNotice(true);
          setTimeout(() => {
            setNotice(false);
          }, 2000);
        });
      })
      .catch(err => console.warn("An unexpected error occured:", err))
      .finally(() => {
        setNameUpdating(false);
        closeNameChange();
      });
  };

  const handleCommand = () => {
    if (!command) {
      return;
    }

    control.get
      .server(id as string)
      .then(({ server }) => {
        server.actions.execute(command);
        setCommand("");
      })
      .catch(err => {
        console.warn("An unexpected error occured:", err);
        setCommand("");
      });
  };

  const loadingIcon = <ActivityIndicator animating={true} />;

  const startButton = (
    <Tooltip title="Start" enterTouchDelay={300} leaveTouchDelay={150}>
      <Appbar.Action
        icon="play-outline"
        onPress={handleStart}
        onPressIn={handleTouch}
      />
    </Tooltip>
  );

  const stopButton = (
    <Tooltip title="Stop" enterTouchDelay={300} leaveTouchDelay={150}>
      <Appbar.Action icon="stop" onPress={handleStop} onPressIn={handleTouch} />
    </Tooltip>
  );

  const killButton = (
    <Tooltip title="Kill" enterTouchDelay={300} leaveTouchDelay={150}>
      <Appbar.Action
        icon="skull-outline"
        onPress={handleKill}
        onPressIn={handleTouch}
      />
    </Tooltip>
  );

  const sendButton = (
    <TextInput.Icon
      icon="send-outline"
      onPress={handleCommand}
      onPressIn={handleTouch}
      disabled={!running || !command.trim()}
    />
  );

  const scrollViewRef = useRef<ScrollView>(null);

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
              onChangeText={newText => setNewName(newText)}
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

      <CustomView>
        <Surface
          style={{
            backgroundColor: theme.colors.surfaceVariant,
            paddingTop: 10,
            paddingBottom: 10,
            paddingLeft: 20,
            paddingRight: 20,
            width: "85%",
            height: "75%",
            borderRadius: 20
          }}
          elevation={2}
        >
          <ScrollView
            style={{ marginBottom: 5 }}
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd()}
            ref={scrollViewRef}
          >
            <ScrollView horizontal>
              <Text
                selectable
                style={{ fontSize: 11, fontFamily: "NotoSansMono_400Regular" }}
              >
                {logs}
              </Text>
            </ScrollView>
          </ScrollView>

          { consolePerms && <TextInput
            label={running ?  "Enter command..." : "Server offline"}
            mode="outlined"
            value={command}
            disabled={!running}
            onChangeText={newText => setCommand(newText)}
            right={sendButton}
          /> }
        </Surface>
      </CustomView>

      <View style={{ width: "90%", alignSelf: "center" }}>
        <Snackbar
          visible={notice}
          onDismiss={() => setNotice(false)}
          style={{ bottom: 20 }}
        >
          Name saved!
        </Snackbar>
      </View>
    </>
  );
}
