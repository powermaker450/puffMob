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

import { ModelsPermissionView } from "@/util/models";
import { router } from "expo-router";
import { List, useTheme } from "react-native-paper";

interface UserProps {
  user: ModelsPermissionView;
}

const User = ({ user }: UserProps) => {
  const theme = useTheme();

  const styles: { item: any; icon: any } = {
    item: {
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: 20,
      marginTop: 7,
      marginBottom: 7
    },
    icon: { marginLeft: 15 }
  };

  return (
    <List.Item
      title={user.username}
      description={user.email}
      style={styles.item}
      onPress={() => router.navigate(`/settings/user/${user.id}`)}
      left={() => <List.Icon icon="account" style={styles.icon} />}
      right={() => <List.Icon icon="chevron-right" />}
    />
  );
};

export default User;
