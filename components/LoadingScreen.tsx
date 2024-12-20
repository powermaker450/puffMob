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

import { View } from "react-native";
import { Appbar, useTheme } from "react-native-paper";

const LoadingScreen = () => {
  const theme = useTheme();

  const styles: { scrollView: any; bottomBar: any; listItem: any; icon: any } =
    {
      scrollView: {
        width: "100%"
      },
      bottomBar: {
        position: "absoloute",
        bottom: 0,
        height: "8%",
        backgroundColor: theme.colors.surfaceDisabled
      },
      listItem: {
        backgroundColor: theme.colors.surfaceVariant,
        borderRadius: 20,
        marginTop: 7,
        marginBottom: 7,
        width: "95%",
        alignSelf: "center"
      },
      icon: {
        marginLeft: 15
      }
    };

  return (
    <>
      <Appbar.Header>
        <></>
      </Appbar.Header>

      <View style={styles.bottomBar} />
    </>
  );
};

export default LoadingScreen;
