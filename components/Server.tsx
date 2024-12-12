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

import { ModelsNodeView } from "@/util/models";
import { router } from "expo-router";
import { Card, Icon, List, useTheme } from "react-native-paper";

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

  const styles: { listItem: any; icon: any } = {
    listItem: {
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: 20,
      marginTop: 7,
      marginBottom: 7,
      width: "95%",
      alignSelf: "center"
    },
    icon: {
      marginLeft: 15
    }
  };

  const chooseColor = () =>
    running ? theme.colors.primary : theme.colors.surfaceDisabled;

  const getDescription = () => {
    if (!node) {
      // 0.0.0.0:8080
      // or
      // 0.0.0.0
      return ip + port ? ":" + port : "";
    }

    // publicHost.example:8080 @ nodeName
    // or
    // publicHost.example @ nodeName
    return (
      node.publicHost + (port ? `:${port} @ ${node.name}` : ` @ ${node.name}`)
    );
  };

  const serverIcon = () => (
    <List.Icon
      icon={running ? "server" : "server-off"}
      color={chooseColor()}
      style={styles.icon}
    />
  );

  const rightArrow = () => <List.Icon icon="chevron-right" />;

  return (
    <List.Item
      title={name}
      description={getDescription()}
      left={serverIcon}
      right={rightArrow}
      style={styles.listItem}
      onPress={() => router.navigate(`/server/${id}`)}
    />
  );
}
