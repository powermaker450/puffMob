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
import { Card, Icon, useTheme } from "react-native-paper";

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
    return node.publicHost + (port ? ":" + port : ` @ ${node.name}`);
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
      style={{
        marginTop: 7,
        marginBottom: 7,
        width: "90%",
        alignSelf: "center"
      }}
      onPress={() => router.navigate(`/server/${id}`)}
    >
      <Card.Title title={name} subtitle={getDescription()} left={serverIcon} />
    </Card>
  );
}
