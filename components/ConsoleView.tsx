import { Surface, Text, TextInput, useTheme } from "react-native-paper";
import CustomView from "./CustomView";
import { ScrollView } from "react-native";
import { useRef, useState } from "react";
import { handleTouch } from "@/util/haptic";
import Panel from "@/util/Panel";
import { useLocalSearchParams } from "expo-router";

interface ConsoleViewProps {
  logs: string[];
  running?: boolean;
  sendConsolePerms?: boolean;
}

const ConsoleView = ({ logs, running, sendConsolePerms }: ConsoleViewProps) => {
  const theme = useTheme();
  const scrollViewRef = useRef<ScrollView>(null);
  const control = Panel.getPanel();
  const { id } = useLocalSearchParams();

  const [command, setCommand] = useState("");

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

  const sendButton = (
    <TextInput.Icon
      icon="send-outline"
      onPress={handleCommand}
      onPressIn={handleTouch}
      disabled={!running || !command.trim()}
    />
  );

  return (
    <CustomView>
      <Surface
        style={{
          backgroundColor: theme.colors.surfaceVariant,
          paddingTop: 10,
          paddingBottom: 10,
          paddingLeft: 20,
          paddingRight: 20,
          width: "90%",
          height: "85%",
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
              style={{
                fontSize: 11,
                fontFamily: "NotoSansMono_400Regular"
              }}
            >
              {logs.map(line =>
                line.replaceAll(
                  /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
                  ""
                )
              )}
            </Text>
          </ScrollView>
        </ScrollView>

        {sendConsolePerms && (
          <TextInput
            label={running ? "Enter command..." : "Server offline"}
            mode="outlined"
            value={command}
            disabled={!running}
            onChangeText={newText => setCommand(newText)}
            right={sendButton}
          />
        )}
      </Surface>
    </CustomView>
  );
};

export default ConsoleView;
