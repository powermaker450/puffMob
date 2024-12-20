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

import CustomView from "@/components/CustomView";
import UnsavedChanges from "@/components/UnsavedChanges";
import { UpdateServerParams } from "@/util/Panel";
import haptic, { handleTouch } from "@/util/haptic";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView } from "react-native";
import {
  ActivityIndicator,
  Appbar,
  Button,
  Checkbox,
  List,
  RadioButton,
  Surface,
  Text,
  TextInput
} from "react-native-paper";
import { usePanel } from "@/contexts/PanelProvider";
import { useNotice } from "@/contexts/NoticeProvider";

export default function panel_settings() {
  const { panel } = usePanel();
  const notice = useNotice();

  const [urlLoad, setUrlLoad] = useState(true);
  const [nameLoad, setNameLoad] = useState(true);
  const [regLoad, setRegLoad] = useState(true);

  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const toggleExpanded = () => setExpanded(expanded => !expanded);

  // User Settings
  const [masterUrl, setMasterUrl] = useState("");
  const [newMasterUrl, setNewMasterUrl] = useState("");
  const changeNewMasterUrl = (newText: string) => setNewMasterUrl(newText);
  const [companyName, setCompanyName] = useState("");
  const [newCompanyName, setNewCompanyName] = useState("");
  const changeNewCompanyName = (newText: string) => setNewCompanyName(newText);
  const [allowReg, setAllowReg] = useState(false);
  const [newAllowReg, setNewAllowReg] = useState(false);
  const [defaultTheme, setDefaultTheme] = useState("");
  const [newDefaultTheme, setNewDefaultTheme] = useState("");
  const changeNewDefaultTheme = (newTheme: string) => {
    haptic();
    setNewDefaultTheme(newTheme);
  };
  const [themeList, setThemeList] = useState<string[]>([]);
  const changeReg = () => {
    newAllowReg ? haptic() : haptic("soft");
    setNewAllowReg(reg => !reg);
  };

  const reset = () => {
    setNewMasterUrl(masterUrl);
    setNewCompanyName(companyName);
    setNewAllowReg(allowReg);
    setNewDefaultTheme(defaultTheme);
    setExpanded(false);
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

    if (
      masterUrl !== newMasterUrl &&
      companyName !== newCompanyName &&
      allowReg !== newAllowReg
    ) {
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

    panel.edit
      .settings(obj)
      .then(() => {
        notice.show("Saved!");

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
      .catch(() => notice.error("An unknown error occured."))
      .finally(() => {
        setLoading(false);
        setExpanded(false);
      });
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
          disabled={
            masterUrl !== newMasterUrl ||
            companyName !== newCompanyName ||
            allowReg !== newAllowReg ||
            defaultTheme !== newDefaultTheme
          }
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
            onChangeText={changeNewMasterUrl}
            disabled={loading || urlLoad}
          />

          <TextInput
            mode="outlined"
            style={textInputMargin}
            label="Company Name"
            value={newCompanyName}
            onChangeText={changeNewCompanyName}
            disabled={loading || nameLoad}
          />

          <List.Section title="Default Theme">
            <List.Accordion
              title={newDefaultTheme}
              expanded={expanded}
              onPress={toggleExpanded}
            >
              <ScrollView
                style={{ maxHeight: 100 }}
                contentContainerStyle={{ width: "95%" }}
              >
                <RadioButton.Group
                  value={newDefaultTheme}
                  onValueChange={changeNewDefaultTheme}
                >
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

            <List.Item
              title="Allow public registration"
              disabled={regLoad}
              onPress={changeReg}
              right={() => (
                <Checkbox
                  status={newAllowReg ? "checked" : "unchecked"}
                  disabled={loading}
                />
              )}
            />
          </List.Section>

          {loading ? (
            loadingIcon
          ) : (
            <Button
              mode="contained"
              onPressIn={handleTouch}
              onPress={handleChange}
              style={{
                marginTop: 15,
                marginBottom: 15,
                width: "50%",
                alignSelf: "center"
              }}
              disabled={
                masterUrl === newMasterUrl &&
                companyName === newCompanyName &&
                allowReg === newAllowReg &&
                defaultTheme === newDefaultTheme
              }
            >
              Save
            </Button>
          )}
        </Surface>
      </CustomView>

      <UnsavedChanges
        condition={
          masterUrl !== newMasterUrl ||
          companyName !== newCompanyName ||
          allowReg !== newAllowReg ||
          defaultTheme !== newDefaultTheme
        }
        reset={reset}
      />
    </>
  );
}
