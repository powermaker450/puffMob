import {
  ActivityIndicator,
  Appbar,
  Button,
  Dialog,
  Portal,
  Snackbar,
  Surface,
  Text,
  TextInput,
  useTheme
} from "react-native-paper";
import CustomView from "@/components/CustomView";
import { storage } from "@/util/storage";
import { router } from "expo-router";
import ButtonContainer from "@/components/ButtonContainer";
import { useEffect, useState } from "react";
import haptic, { handleTouch } from "@/util/haptic";
import { View } from "react-native";
import Panel, { PanelParams, UpdateUserParams } from "@/util/Panel";

export default function account() {
  const theme = useTheme();

  const buttonMargin = {
    marginTop: 20,
    marginBottom: 20,
    marginLeft: 5,
    marginRight: 5
  };
  const textInputMargin = {
    marginTop: 5,
    marginBottom: 5
  };

  const [logoutSplash, setLogoutSplash] = useState(false);
  const [notice, setNotice] = useState(false);
  const [noticeText, setNoticeText] = useState("");
  const showNotice = (error?: boolean) => {
    setNotice(true);
    setNoticeText(error ? "Incorrect password." : "Saved!");
    !notice &&
      setTimeout(() => {
        setNotice(false);
        setNoticeText("");
      }, 2000);
  };

  const [loading, setLoading] = useState(false);
  const [gettingDetails, setGettingDetails] = useState(true);

  const [username, setUsername] = useState("");
  const [newUsername, setNewUsername] = useState("");

  const [email, setEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");

  const [password, setPassword] = useState("");

  const handleLogout = () => {
    storage.delete("settings");
    storage.delete("cachedToken");
    storage.delete("cachedServerList");
    router.replace("/");
    setLogoutSplash(false);
  };

  useEffect(() => {
    const settings = JSON.parse(storage.getString("settings")!);
    const panel = new Panel(settings);

    panel.get.self().then(({ username, email }) => {
      setUsername(username!);
      setNewUsername(username!);

      setEmail(email!);
      setNewEmail(email!);

      setGettingDetails(false);
    });
  }, []);

  const handleDetailsChange = () => {
    setLoading(true);

    const settings: PanelParams = JSON.parse(storage.getString("settings")!);
    const panel = new Panel(settings);
    let obj: UpdateUserParams;

    if (newUsername !== username && newEmail !== email) {
      obj = { password, email: newEmail, username: newUsername };
    } else if (newUsername === username) {
      obj = { password, email: newEmail };
    } else {
      obj = { password, username: newUsername };
    }

    panel.edit
      .user(obj)
      .then(() => {
        showNotice();
        haptic("notificationSuccess");

        if (newUsername !== username && newEmail !== email) {
          setUsername(newUsername);
          setEmail(newEmail);
        } else if (newUsername === username) {
          setEmail(newEmail);
          storage.set(
            "settings",
            JSON.stringify({
              password: settings.password,
              serverUrl: settings.serverUrl,
              email: newEmail
            })
          );
        } else {
          setUsername(newUsername);
        }

        setPassword("");
      })
      .catch(() => {
        showNotice(true);
        haptic("notificationError");
      })
      .finally(() => setLoading(false));
  };

  const loadingIcon = (
    <ActivityIndicator
      animating
      size="large"
      style={{ marginTop: 15, marginBottom: 15 }}
    />
  );

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction
          onPressIn={handleTouch}
          onPress={() => router.back()}
        />
        <Appbar.Content title="Account" />
      </Appbar.Header>

      <CustomView>
        <Portal>
          <Dialog
            visible={logoutSplash}
            onDismiss={() => setLogoutSplash(false)}
          >
            <Dialog.Title>
              <Text style={{ fontWeight: "bold" }}>Log out</Text>
            </Dialog.Title>
            <Dialog.Content>
              <Text>Are you sure you want to log out?</Text>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setLogoutSplash(false)}>Cancel</Button>
              <Button
                mode="contained"
                style={{
                  backgroundColor: theme.colors.tertiary,
                  paddingLeft: 10,
                  paddingRight: 10
                }}
                onPress={handleLogout}
              >
                Log out
              </Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>

        <Surface style={{ padding: 20, borderRadius: 20, width: "85%" }}>
          <Text
            style={{ marginTop: 15, marginBottom: 15, alignSelf: "center" }}
            variant="titleLarge"
            disabled={gettingDetails}
          >
            Account Details
          </Text>

          <TextInput
            mode="outlined"
            style={textInputMargin}
            label="Username"
            value={newUsername}
            disabled={gettingDetails}
            onChangeText={text => setNewUsername(text)}
          />

          <TextInput
            mode="outlined"
            style={textInputMargin}
            label="Email"
            value={newEmail}
            onChangeText={text => setNewEmail(text)}
            disabled={gettingDetails}
            textContentType="emailAddress"
          />

          <TextInput
            mode="outlined"
            style={textInputMargin}
            label="Password"
            value={password}
            onChangeText={text => setPassword(text)}
            secureTextEntry
            disabled={gettingDetails}
            textContentType="password"
          />

          {loading ? (
            loadingIcon
          ) : (
            <Button
              mode="contained"
              onPressIn={handleTouch}
              onPress={handleDetailsChange}
              disabled={
                !password || (username === newUsername && email === newEmail)
              }
              style={{
                marginTop: 15,
                marginBottom: 15,
                width: "50%",
                alignSelf: "center"
              }}
            >
              Save
            </Button>
          )}
        </Surface>

        <ButtonContainer>
          <Button
            mode="contained"
            onPressIn={handleTouch}
            onPress={() => setLogoutSplash(true)}
            style={{ ...buttonMargin }}
          >
            Log out
          </Button>
        </ButtonContainer>
      </CustomView>

      <View style={{ width: "90%", alignSelf: "center", bottom: 20 }}>
        <Snackbar visible={notice} onDismiss={() => setNotice(false)}>
          {noticeText}
        </Snackbar>
      </View>
    </>
  );
}
