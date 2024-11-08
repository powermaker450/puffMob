import { ModelsNodeView } from "@/util/models";
import { useMaterial3Theme } from "@pchmn/expo-material3-theme";
import { useState } from "react";
import { useColorScheme } from "react-native";
import { List, Tooltip, useTheme } from "react-native-paper";
import { Marquee } from "@animatereactnative/marquee";

interface ServerProps {
  name: string;
  ip: string;
  port: number;
  node: ModelsNodeView;
  running?: boolean;
}

export default function Server({ name, ip, port, node, running }: ServerProps) {
  const [waiting, setWaiting] = useState(true);
  const theme = useTheme();
  const colorScheme = useColorScheme();

  const chooseColor = () => running ? theme.colors.primary : theme.colors.surfaceDisabled;

  const getDescription = () => {
    if (!node) {
      return ip + port ? ":" + port : "";
    }

    return (node.publicHost + (port ? ":" + port : ""));
  }

  const serverIcon = (
    <List.Icon
      icon={running ? "server" : "server-off"}
      color={chooseColor()}
    />
  );

  return (
    <Tooltip
      title={name}
      enterTouchDelay={300}
      leaveTouchDelay={150}
    >
      <List.Item
        title={name}
        description={getDescription()}
        onPress={() => console.log("Clicked", { name, ip, port, node, running })}
        style={{
          paddingLeft: 10,
          paddingRight: 10,
        }}
        left={() => serverIcon}
      />
    </Tooltip>
  )
}
