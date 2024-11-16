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
import { Snackbar } from "react-native-paper";

interface NoticeProps {
  condition: boolean;
  setCondition: React.Dispatch<React.SetStateAction<boolean>>;
  text: string;
}

const Notice = ({ condition, setCondition, text }: NoticeProps) => {
  return (
    <View style={{ width: "90%", alignSelf: "center", bottom: 20 }}>
      <Snackbar visible={condition} onDismiss={() => setCondition(false)}>
        {text}
      </Snackbar>
    </View>
  );
};

export default Notice;
