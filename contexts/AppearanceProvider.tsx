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

import { storage } from "@/util/storage";
import { ReactNode, createContext, useContext } from "react";
import { useMMKVBoolean } from "react-native-mmkv";

type setMMKVVar = (
  value: boolean | ((current: boolean | undefined) => boolean) | undefined
) => void;

interface AppearanceProviderProps {
  children: ReactNode;
}

interface AppearanceProviderData {
  highContrastConsole: boolean | undefined;
  setHighContrastConsole: setMMKVVar;
}

const AppearanceContext = createContext<AppearanceProviderData | undefined>(
  undefined
);

export const AppearanceProvider = ({ children }: AppearanceProviderProps) => {
  const [systemColors, setSystemColors] = useMMKVBoolean(
    "systemColors",
    storage
  );
  const [highContrastConsole, setHighContrastConsole] = useMMKVBoolean(
    "highContrastConsole",
    storage
  );
  systemColors === undefined && setSystemColors(false);
  highContrastConsole === undefined && setHighContrastConsole(false);

  return (
    <AppearanceContext.Provider
      value={{ highContrastConsole, setHighContrastConsole }}
    >
      {children}
    </AppearanceContext.Provider>
  );
};

export const useAppearance = () => {
  const context = useContext(AppearanceContext);

  if (context === undefined) {
    throw new Error("useAppearance must be called within a AppearanceProvider");
  }

  return context;
};
