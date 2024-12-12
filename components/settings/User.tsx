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
