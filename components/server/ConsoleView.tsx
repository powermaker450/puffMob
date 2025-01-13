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

import { Surface, Text, TextInput, useTheme } from "react-native-paper";
import CustomView from "../CustomView";
import { ScrollView } from "react-native";
import { useEffect, useRef, useState } from "react";
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
  const consoleTextColor = highContrastConsole
    ? { color: "#fff" }
    : {};

  const scrollViewRef = useRef<ScrollView>(null);

  const [running, setRunning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [command, setCommand] = useState("");
  const clearCommand = () => setCommand("");

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
    if (!command.trim()) {
      return;
    }

    data!.server.actions
      .execute(command)
      .catch(handleErr)
      .finally(clearCommand);
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
          backgroundColor: consoleColor,
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
          <TextInput
            label={running ? "Enter command..." : "Server offline"}
            mode="outlined"
            value={command}
            disabled={!running}
            onChangeText={setCommand}
            right={sendButton}
            onSubmitEditing={handleCommand}
          />
        )}
      </Surface>
    </CustomView>
  );
};

export default ConsoleView;
