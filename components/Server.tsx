import haptic from "@/util/haptic";
import { ModelsNodeView } from "@/util/models";
import { router } from "expo-router";
import { useState } from "react";
import { Card, Icon, Modal, Portal, Text, useTheme } from "react-native-paper";

interface ServerProps {
  name: string;
  id: string;
  ip: string;
  port: number;
  node: ModelsNodeView;
  running?: boolean;
}

export default function Server({
  name,
  id,
  ip,
  port,
  node,
  running
}: ServerProps) {
  const theme = useTheme();

  const chooseColor = () =>
    running ? theme.colors.primary : theme.colors.surfaceDisabled;

  const getDescription = () => {
    if (!node) {
      // 0.0.0.0:8080
      // or
      // 0.0.0.0
      return ip + port ? ":" + port : "";
    }

    // publicHost.example:8080
    // or
    // publicHost.example
    return node.publicHost + (port ? ":" + port : "");
  };

  const serverIcon = () => (
    <Icon
      source={running ? "server" : "server-off"}
      color={chooseColor()}
      size={25}
    />
  );

  return (
    <Card
      style={{ paddingLeft: 10, paddingRight: 10, marginBottom: 10 }}
      onPress={() => router.navigate(`/server/${id}`)}
    >
      <Card.Title
        title={name}
        subtitle={getDescription()}
        left={serverIcon}
      />
    </Card>
  );
}
