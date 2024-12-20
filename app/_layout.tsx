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

import { useMaterial3Theme } from "@pchmn/expo-material3-theme";
import { PaperProvider, MD3DarkTheme, MD3LightTheme } from "react-native-paper";
import { View, useColorScheme } from "react-native";
import { PanelProvider } from "@/contexts/PanelProvider";
import RootNavigation from "@/components/RootNavigation";
import { ServerProvider } from "@/contexts/ServerProvider";
import { NoticeProvider } from "@/contexts/NoticeProvider";

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const { theme } = useMaterial3Theme({ fallbackSourceColor: "#07a7e3" });
  const paperTheme =
    colorScheme === "dark"
      ? { ...MD3DarkTheme, colors: theme.dark }
      : { ...MD3LightTheme, colors: theme.light };

  return (
    <PaperProvider theme={paperTheme}>
      <PanelProvider>
        <ServerProvider>
          <NoticeProvider>
            <View
              style={{
                flex: 1,
                backgroundColor:
                  colorScheme === "dark"
                    ? theme.dark.background
                    : theme.light.background
              }}
            >
              <RootNavigation />
            </View>
          </NoticeProvider>
        </ServerProvider>
      </PanelProvider>
    </PaperProvider>
  );
}
