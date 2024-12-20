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
import { ReactNode, createContext, useContext, useState } from "react";
import { Portal, Snackbar } from "react-native-paper";

interface NoticeProviderProps {
  children: ReactNode;
}

interface NoticeProviderData {
  show: (text: string) => void;
  error: (text: string) => void;
}

const NoticeContext = createContext<NoticeProviderData | undefined>(undefined);

export const NoticeProvider = ({ children }: NoticeProviderProps) => {
  const [text, setText] = useState("");
  const [notice, setNotice] = useState(false);
  const hideNotice = () => {
    setNotice(false);
    setText("");
  };

  const showNotice = (text: string) => {
    haptic("notificationSuccess");
    setText(text);
    setNotice(true);
    setTimeout(hideNotice, 2000);
  };

  const showError = (text: string) => {
    haptic("notificationError");
    setText(text);
    setNotice(true);
    setTimeout(hideNotice, 2000);
  };

  const styles: { bar: any } = {
    bar: {
      width: "95%",
      alignSelf: "center",
      marginBottom: 15
    }
  };

  return (
    <NoticeContext.Provider value={{ show: showNotice, error: showError }}>
      {children}

      <Portal>
        <Snackbar style={styles.bar} visible={notice} onDismiss={hideNotice}>
          {text}
        </Snackbar>
      </Portal>
    </NoticeContext.Provider>
  );
};

export const useNotice = () => {
  const context = useContext(NoticeContext);

  if (context === undefined) {
    throw new Error("useNotice must be called within a NoticeProvider");
  }

  return context;
};
