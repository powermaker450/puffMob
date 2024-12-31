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

import { Stack, router } from "expo-router";
import { useColorScheme } from "react-native";
import { useMaterial3Theme } from "@pchmn/expo-material3-theme";
import { useEffect } from "react";
import { usePanel } from "@/contexts/PanelProvider";

const RootNavigation = () => {
  const { theme } = useMaterial3Theme({ fallbackSourceColor: "#07a7e3" });
  const colorScheme = useColorScheme();
  const { loggedIn } = usePanel();

  useEffect(
    () => router.replace(loggedIn ? "/(app)/home" : "/(auth)"),
    [loggedIn]
  );

  const getColor = () =>
    colorScheme === "dark" ? theme.dark.background : theme.light.background;

  const options = {
    headerShown: false,
    contentStyle: {
      backgroundColor: getColor()
    }
  };

  return (
    <Stack screenOptions={options}>
      <Stack.Screen name="(auth)/index" />
      <Stack.Screen name="(app)/home/index" />
    </Stack>
  );
};

export default RootNavigation;
