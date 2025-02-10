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
  IconButton,
  Surface,
  Text,
  TextInput,
  useTheme
} from "react-native-paper";
import CustomView from "../CustomView";
import { ScrollView, View } from "react-native";
import { ComponentProps, useEffect, useRef, useState } from "react";
import { handleTouch } from "@/util/haptic";
import { AnsiComponent } from "react-native-ansi-view";
import { useServer } from "@/contexts/ServerProvider";
import { useAppearance } from "@/contexts/AppearanceProvider";

const ConsoleView = () => {
  const theme = useTheme();
  const { data } = useServer();
  const { highContrastConsole } = useAppearance();
  const consoleColor = highContrastConsole
    ? "#000"
    : theme.colors.surfaceVariant;
  const consoleTextColor = highContrastConsole ? { color: "#fff" } : {};

  const scrollViewRef = useRef<ScrollView>(null);

  const [running, setRunning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [commands, setCommands] = useState<string[]>([""]);
  const [commandIndex, setCommandIndex] = useState(commands.length - 1);
  const setCurrentCommand = (value: string) =>
    setCommands(v =>
      v.map((command, index) => (index === commandIndex ? value : command))
    );
  const pushCurrentCommand = () => setCommands(v => [...v, ""]);

  const incrementCommandIndex = () =>
    commandIndex + 1 < commands.length && setCommandIndex(v => v + 1);
  const decrementCommandIndex = () =>
    commandIndex - 1 > -1 && setCommandIndex(v => v - 1);

  const noCommand = !commands[commandIndex].trim();

  // Reset the command text box when the current command is pushed
  useEffect(() => setCommandIndex(commands.length - 1), [commands]);

  const styles: {
    actionRow: ComponentProps<typeof View>["style"];
    surfaceView: ComponentProps<typeof Surface>["style"];
  } = {
    actionRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "flex-start"
    },
    surfaceView: {
      backgroundColor: consoleColor,
      paddingTop: 10,
      paddingBottom: 10,
      paddingLeft: 20,
      paddingRight: 20,
      width: "90%",
      height: "85%",
      borderRadius: 20
    }
  };

  useEffect(() => {
    if (!data) {
      return;
    }
    const {
      server: { socket },
      permissions
    } = data;

    if (permissions.viewServerConsole) {
      socket.on("status", ({ running }) => setRunning(running));
      socket.on("console", ({ logs }) => setLogs(v => v.concat(logs)));
    } else {
      setLogs(["No logs :("]);
    }
  }, [data]);

  const sendServerConsole = data?.permissions.sendServerConsole ?? false;

  const handleErr = (err: any) =>
    console.warn("An unexpected error occured: ", err);

  const handleCommand = () => {
    if (noCommand) {
      return;
    }

    data!.server.actions
      .execute(commands[commandIndex])
      .catch(handleErr)
      .finally(pushCurrentCommand);
  };

  const sendButton = (
    <TextInput.Icon
      icon="send-outline"
      onPress={handleCommand}
      onPressIn={handleTouch}
      disabled={!running || noCommand}
    />
  );

  return (
    <CustomView>
      <Surface style={styles.surfaceView} elevation={2}>
        <ScrollView
          style={{ marginBottom: 5 }}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd()}
          ref={scrollViewRef}
        >
          <ScrollView horizontal>
            <Text selectable>
              {logs.map((line, index) => (
                <AnsiComponent
                  containerStyle={{
                    fontSize: 11,
                    fontFamily: "NotoSansMono_400Regular",
                    ...consoleTextColor
                  }}
                  ansi={line}
                  key={`k-${index}`}
                />
              ))}
            </Text>
          </ScrollView>
        </ScrollView>

        {sendServerConsole && (
          <>
            <View style={styles.actionRow}>
              <IconButton
                icon="chevron-up"
                onPressIn={handleTouch}
                onPress={decrementCommandIndex}
                disabled={!running || commandIndex === 0}
              />
              <IconButton
                icon="chevron-down"
                onPressIn={handleTouch}
                onPress={incrementCommandIndex}
                disabled={!running || commandIndex === commands.length - 1}
              />
            </View>

            <TextInput
              style={{ width: "100%" }}
              label={running ? "Enter command..." : "Server offline"}
              mode="outlined"
              value={commands[commandIndex]}
              disabled={!running}
              onChangeText={setCurrentCommand}
              right={sendButton}
              onSubmitEditing={handleCommand}
            />
          </>
        )}
      </Surface>
    </CustomView>
  );
};

export default ConsoleView;
