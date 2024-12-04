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

import { Languages } from "@rivascva/react-native-code-editor/lib/typescript/languages";

interface LanguageType {
  extensions: string[];
  literalType: Languages;
}

const languageTypes: LanguageType[] = [
  {
    extensions: ["json"],
    literalType: "json"
  },
  {
    extensions: ["sh"],
    literalType: "shell"
  },
  {
    extensions: ["ps", "bat"],
    literalType: "powershell"
  }
];

export default function determineFileType(filename: string): Languages {
  for (const { extensions, literalType } of languageTypes) {
    for (const extension of extensions) {
      if (filename.endsWith(extension)) {
        return literalType;
      }
    }
  }

  return "shell";
}
