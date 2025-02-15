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

import { useAppearance } from "@/contexts/AppearanceProvider";
import haptic, { handleTouch } from "@/util/haptic";
import { router } from "expo-router";
import { ComponentProps } from "react";
import { ScrollView } from "react-native";
import { Appbar, List, Switch } from "react-native-paper";

export default function appearance() {
  const { highContrastConsole, setHighContrastConsole } = useAppearance();
  const toggleContrastConsole = () => {
    haptic(highContrastConsole ? "contextClick" : "soft");
    setHighContrastConsole(v => !v);
  };

  const styles: { icon: ComponentProps<(typeof List)["Icon"]>["style"] } = {
    icon: {
      marginLeft: 15
    }
  };

  // Get it? sigh
  const eyeCon = () => <List.Icon style={styles.icon} icon="monitor-eye" />;
  const contrastConsoleSwitch = () => (
    <Switch value={highContrastConsole} onValueChange={toggleContrastConsole} />
  );

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPressIn={handleTouch} onPress={router.back} />
        <Appbar.Content title="Appearance" />
      </Appbar.Header>

      <ScrollView contentContainerStyle={{ justifyContent: "center" }}>
        <List.Item
          title="High-contrast console"
          description="Make the console text more legible, if the MD3 colors make it difficult"
          left={eyeCon}
          right={contrastConsoleSwitch}
          onPress={toggleContrastConsole}
        />
      </ScrollView>
    </>
  );
}
