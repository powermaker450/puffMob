import { Button, Dialog, Portal, Text, useTheme } from "react-native-paper";
import CustomView from "./CustomView";
import { storage } from "@/util/storage";
import { router } from "expo-router";
import ButtonContainer from "./ButtonContainer";
import { useState } from "react";
import { handleTouch } from "@/util/haptic";

export default function AccountPage() {
  const theme = useTheme();

  const buttonMargin = {
    marginTop: 20,
    marginBottom: 20,
    marginLeft: 5,
    marginRight: 5
  };
  const [logoutSplash, setLogoutSplash] = useState(false);

  return (
    <CustomView>
      <Portal>
        <Dialog visible={logoutSplash} onDismiss={() => setLogoutSplash(false)}>
          <Dialog.Title>
            <Text style={{ fontWeight: "bold" }}>Logout</Text>
          </Dialog.Title>
          <Dialog.Content>
            <Text>Are you sure you want to logout?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setLogoutSplash(false)}>
              <Text>Cancel</Text>
            </Button>

            <Button
              onPress={() => {
                storage.delete("settings");
                storage.delete("cachedToken");
                storage.delete("cachedServerList");
                router.replace("/");
                setLogoutSplash(false);
              }}
            >
              <Text
                style={{ color: theme.colors.tertiary, fontWeight: "bold" }}
              >
                Log out
              </Text>
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <ButtonContainer>
        <Button
          mode="contained"
          onPressIn={handleTouch}
          onPress={() => setLogoutSplash(true)}
          style={{ ...buttonMargin }}
        >
          Logout
        </Button>
      </ButtonContainer>
    </CustomView>
  );
}
