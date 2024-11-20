import CustomView from "@/components/CustomView";
import Panel from "@/util/Panel";
import { handleTouch } from "@/util/haptic";
import { router } from "expo-router";
import { Appbar, Card, Text } from "react-native-paper";

export default function addUser() {
  const panel = Panel.getPanel();

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPressIn={handleTouch} onPress={() => router.back()} />
        <Appbar.Content title="Add User" />
      </Appbar.Header>

      <CustomView>
        <Card contentStyle={{ flex: 1, alignContent: "center", justifyContent: "center" }}>
          <Text>User Form</Text>
        </Card>
      </CustomView>
    </>
  );
}
