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

import haptic from "@/util/haptic";
import { ScrollView } from "react-native";
import { Button } from "react-native-paper";

interface PathListProps {
  pathList: string[];
  setPath: React.Dispatch<React.SetStateAction<string[]>>;
}

const PathList = ({ pathList, setPath }: PathListProps) => {
  return (
    <ScrollView
      style={{ width: "95%", margin: "auto", marginTop: 10, height: 50, maxHeight: 50, marginBottom: 10 }}
      horizontal
    >
      {pathList.map((pathname, index) => {
        return (
          <Button
            key={index}
            style={{ marginLeft: 5, marginRight: 5, height: 45 }}
            mode="outlined"
            onPress={() => {
              haptic();
              (pathList.length > 1 && pathList[pathList.length - 1] !== pathname) && setPath(pathList => pathList.slice(0, pathList.indexOf(pathname) + 1));
            }}
          >
            {pathname === "./" ? "/" : pathname.replace("/", "")}
          </Button>
        );
      })}
    </ScrollView>
  );
};

export default PathList;
