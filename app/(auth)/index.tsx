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

import ButtonContainer from "@/components/ButtonContainer";
import CustomView from "@/components/CustomView";
import LoadingScreen from "@/components/LoadingScreen";
import { usePanel } from "@/contexts/PanelProvider";
import { handleTouch } from "@/util/haptic";
import { useState } from "react";
import { StyleProp, TextStyle } from "react-native";
import { Button, Text, TextInput } from "react-native-paper";

const textInputStyle: StyleProp<TextStyle> = {
  maxHeight: 70,
  width: "75%",
  margin: 10
};

export default function Index() {
  const { login, loggedIn, error, clearError } = usePanel();

  const [serverUrl, setServerUrl] = useState("");
  const changeServerUrl = (newText: string) => setServerUrl(newText);
  const [email, setEmail] = useState("");
  const changeEmail = (newText: string) => setEmail(newText);
  const [password, setPassword] = useState("");
  const changePassword = (newText: string) => setPassword(newText);

  const errorText = (
    <CustomView>
      <Text variant="bodyLarge" style={{ margin: 30 }}>
        Something went wrong. Check that your server URL and credentials are
        correct.
      </Text>

      <Button
        mode="contained"
        style={{ margin: 10 }}
        onPress={() => {
          clearError();
        }}
      >
        Back to login
      </Button>
    </CustomView>
  );

  const loginText = (
    <CustomView>
      <Text variant="displaySmall" style={{ margin: 30 }}>
        puffMob
      </Text>

      <TextInput
        mode="outlined"
        style={textInputStyle}
        label="Endpoint"
        value={serverUrl}
        placeholder="http://localhost:8080"
        onChangeText={changeServerUrl}
      />

      <TextInput
        mode="outlined"
        style={textInputStyle}
        label="Email"
        value={email}
        onChangeText={changeEmail}
        textContentType="emailAddress"
      />

      <TextInput
        mode="outlined"
        style={textInputStyle}
        label="Password"
        value={password}
        secureTextEntry
        textContentType="password"
        onChangeText={changePassword}
      />

      <ButtonContainer>
        <Button
          style={{ margin: 10 }}
          mode="contained"
          onPressIn={handleTouch}
          onPress={() => login({ serverUrl, email, password })}
          disabled={
            !(
              serverUrl.startsWith("http://") ||
              serverUrl.startsWith("https://")
            ) ||
            !email.match(/[a-zA-Z0-9].*@[a-zA-Z0-9].*\.[a-zA-Z0-9]/) ||
            !password
          }
        >
          Login
        </Button>
      </ButtonContainer>
    </CustomView>
  );

  return <>{error ? errorText : loggedIn ? <LoadingScreen /> : loginText}</>;
}
