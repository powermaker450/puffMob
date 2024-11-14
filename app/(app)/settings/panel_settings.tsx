import CustomView from "@/components/CustomView";
import Notice from "@/components/Notice";
import UnsavedChanges from "@/components/UnsavedChanges";
import Panel, { UpdateServerParams } from "@/util/Panel";
import haptic, { handleTouch } from "@/util/haptic";
import { storage } from "@/util/storage";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, View } from "react-native";
import { ActivityIndicator, Appbar, Button, List, RadioButton, Snackbar, Surface, Switch, Text, TextInput } from "react-native-paper";

export default function panel_settings() {
  const settings = JSON.parse(storage.getString("settings")!);
  const panel = new Panel(settings);

  const [urlLoad, setUrlLoad] = useState(true);
  const [nameLoad, setNameLoad] = useState(true);
  const [regLoad, setRegLoad] = useState(true);

  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [noticeText, setNoticeText] = useState("");
  const showNotice = (error?: boolean) => {
    setNotice(true);
    setNoticeText(error ? "Something went wrong." : "Saved!");
    !notice &&
      setTimeout(() => {
        setNotice(false);
        setNoticeText("");
      }, 2000);
  };

  // User Settings
  const [masterUrl, setMasterUrl] = useState("");
  const [newMasterUrl, setNewMasterUrl] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [newCompanyName, setNewCompanyName] = useState("");
  const [allowReg, setAllowReg] = useState(false);
  const [newAllowReg, setNewAllowReg] = useState(false);
  const [defaultTheme, setDefaultTheme] = useState("");
  const [newDefaultTheme, setNewDefaultTheme] = useState("");
  const [themeList, setThemeList] = useState<string[]>([]);
  const changeReg = () => {
    newAllowReg ? haptic() : haptic("soft")
    setNewAllowReg(!newAllowReg);
  };

  const reset = () => {
    setNewMasterUrl(masterUrl);
    setNewCompanyName(companyName);
    setNewAllowReg(allowReg);
    setNewDefaultTheme(defaultTheme);
    setExpanded(false);
  }

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
      setUrlLoad(false);
    });

    panel.get.panelSetting("panel.settings.companyName").then(({ value }) => {
      if (typeof value !== "string") {
        return;
      }

      setCompanyName(value);
      setNewCompanyName(value);
      setNameLoad(false);
    });

    panel.get.panelSetting("panel.registrationEnabled").then(({ value }) => {
      if (typeof value !== "boolean") {
        return;
      }

      setAllowReg(value);
      setNewAllowReg(value);
      setRegLoad(false);
    });

    panel.get.panelSetting("panel.settings.defaultTheme").then(({ value }) => {
      if (typeof value !== "string") {
        return;
      }

      setNewDefaultTheme(value);
      setDefaultTheme(value);
    });

    panel.get.config().then(({ themes }) => setThemeList(themes.available));
  }, []);

  const handleChange = () => {
    setLoading(true);

    let obj: UpdateServerParams = {
      "panel.settings.masterUrl": masterUrl,
      "panel.settings.companyName": companyName,
      "panel.registrationEnabled": allowReg,
      "panel.settings.defaultTheme": defaultTheme
    };

    if (masterUrl !== newMasterUrl && companyName !== newCompanyName && allowReg !== newAllowReg) {
      obj["panel.settings.masterUrl"] = newMasterUrl;
      obj["panel.settings.companyName"] = newCompanyName;
      obj["panel.registrationEnabled"] = newAllowReg;
    }

    if (masterUrl !== newMasterUrl) {
      obj["panel.settings.masterUrl"] = newMasterUrl;
    }

    if (companyName !== newCompanyName) {
      obj["panel.settings.companyName"] = newCompanyName;
    }

    if (allowReg !== newAllowReg) {
      obj["panel.registrationEnabled"] = newAllowReg;
    }

    if (defaultTheme !== newDefaultTheme) {
      obj["panel.settings.defaultTheme"] = newDefaultTheme;
    }

    panel.edit.settings(obj)
      .then(() => {
        showNotice();
        haptic("notificationSuccess");

        if (masterUrl !== newMasterUrl) {
          setMasterUrl(newMasterUrl);
        }

        if (companyName !== newCompanyName) {
          setCompanyName(newCompanyName);
        }

        if (allowReg !== newAllowReg) {
          setAllowReg(newAllowReg);
        }

        if (defaultTheme !== newDefaultTheme) {
            setDefaultTheme(newDefaultTheme);
        }
      })
      .catch(() => {
        showNotice(true);
        haptic("notificationError");
      })
      .finally(() => setLoading(false));
  }

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
          disabled={masterUrl !== newMasterUrl || companyName !== newCompanyName || allowReg !== newAllowReg || defaultTheme !== newDefaultTheme}
          onPressIn={handleTouch}
          onPress={() => router.back()}
        />
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
            disabled={loading || urlLoad}
          />

          <TextInput
            mode="outlined"
            style={textInputMargin}
            label="Company Name"
            value={newCompanyName}
            onChangeText={text => setNewCompanyName(text)}
            disabled={loading || nameLoad}
          />

          <List.Section title="Default Theme">
            <List.Accordion
              title={newDefaultTheme}
              expanded={expanded}
              onPress={() => setExpanded(!expanded)}
            >
              <ScrollView style={{maxHeight: 100}}>
                <RadioButton.Group value={newDefaultTheme} onValueChange={val => {
                  haptic();
                  setNewDefaultTheme(val);
                }}>
                  {themeList.map((theme, index) => {
                    return (
                      <RadioButton.Item
                        key={index}
                        label={theme}
                        value={theme}
                        disabled={loading}
                      />
                    );
                  })}
                </RadioButton.Group>
              </ScrollView>
            </List.Accordion>
          </List.Section>

          <View style={{ marginTop: 10, alignItems: "center" }}>
            <Text style={{ marginBottom: 5 }}>Allow public registration</Text>
            <Switch
              value={newAllowReg}
              onValueChange={changeReg}
              disabled={loading || regLoad}
            />
          </View>

          { loading ? loadingIcon : <Button
            mode="contained"
            onPressIn={handleTouch}
            onPress={handleChange}
            style={{
              marginTop: 15,
              marginBottom: 15,
              width: "50%",
              alignSelf: "center"
            }}
            disabled={masterUrl === newMasterUrl && companyName === newCompanyName && allowReg === newAllowReg && defaultTheme === newDefaultTheme}
          >
            Save
          </Button> }
        </Surface>
      </CustomView>

      <Notice
        condition={notice}
        setCondition={setNotice}
        text={noticeText}
      />

      <UnsavedChanges
        condition={masterUrl !== newMasterUrl || companyName !== newCompanyName || allowReg !== newAllowReg || defaultTheme !== newDefaultTheme}
        reset={reset}
      />
    </>
  );
}
