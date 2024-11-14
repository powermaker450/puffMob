import CustomView from "@/components/CustomView";
import Panel from "@/util/Panel";
import haptic, { handleTouch } from "@/util/haptic";
import { storage } from "@/util/storage";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { Appbar, Button, Surface, Switch, Text, TextInput } from "react-native-paper";

export default function panel_settings() {
  const settings = JSON.parse(storage.getString("settings")!);
  const panel = new Panel(settings);

  const [masterUrl, setMasterUrl] = useState("");
  const [newMasterUrl, setNewMasterUrl] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [newCompanyName, setNewCompanyName] = useState("");
  const [allowReg, setAllowReg] = useState(false);
  const [newAllowReg, setNewAllowReg] = useState(false);
  const changeReg = () => {
    haptic();
    setNewAllowReg(!newAllowReg);
  };

  const textInputMargin = {
    marginTop: 5,
    marginBottom: 5
  };

  useEffect(() => {
    panel.get.panelSetting("panel.settings.masterUrl").then(({ value }) => {
      if (typeof value !== "string") {
        return;
      }

      setMasterUrl(value);
      setNewMasterUrl(value);
    });

    panel.get.panelSetting("panel.settings.companyName").then(({ value }) => {
      if (typeof value !== "string") {
        return;
      }

      setCompanyName(value);
      setNewCompanyName(value);
    });

    panel.get.panelSetting("panel.registrationEnabled").then(({ value }) => {
      if (typeof value !== "boolean") {
        return;
      }

      setAllowReg(value);
      setNewAllowReg(value);
    });
  }, [])

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPressIn={handleTouch} onPress={() => router.back()} />
        <Appbar.Content title="Panel Settings" />
      </Appbar.Header>

      <CustomView>
        <Surface style={{ padding: 20, borderRadius: 20, width: "85%" }}>
          <Text
            style={{ marginTop: 15, marginBottom: 15, alignSelf: "center" }}
            variant="titleLarge"
          >
            Settings
          </Text>

          <TextInput
            mode="outlined"
            style={textInputMargin}
            label="Master URL"
            value={newMasterUrl}
            onChangeText={text => setNewMasterUrl(text)}
            disabled
          />

          <TextInput
            mode="outlined"
            style={textInputMargin}
            label="Company Name"
            value={newCompanyName}
            onChangeText={text => setNewCompanyName(text)}
            disabled
          />

          <View style={{ marginTop: 10, alignItems: "center" }}>
            <Text style={{ marginBottom: 5 }}>Allow registration</Text>
            <Switch
              value={newAllowReg}
              onValueChange={changeReg}
              disabled
            />
          </View>

          <Button
            mode="contained"
            onPressIn={handleTouch}
            style={{
              marginTop: 15,
              marginBottom: 15,
              width: "50%",
              alignSelf: "center"
            }}
            disabled
          >
            Save
          </Button>
        </Surface>
      </CustomView>
    </>
  );
}
