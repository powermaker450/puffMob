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
import { useServer } from "@/contexts/ServerProvider";
import haptic, { handleTouch } from "@/util/haptic";
import { ModelsCreatedClient, NewClient } from "@/util/models";
import Clipboard from "@react-native-clipboard/clipboard";
import { router } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import {
  ActivityIndicator,
  Appbar,
  Button,
  Modal,
  Portal,
  Text,
  TextInput,
  useTheme
} from "react-native-paper";

export default function add() {
  const theme = useTheme();
  const { data } = useServer();

  const [newClient, setNewClient] = useState<NewClient>({
    name: "",
    description: ""
  });
  const setName = (name: string) => setNewClient(v => ({ ...v, name }));
  const setDesc = (description: string) =>
    setNewClient(v => ({ ...v, description }));

  const [loading, setLoading] = useState(false);
  const startLoading = () => setLoading(true);
  const stopLoading = () => setLoading(false);

  const loadingText = <ActivityIndicator animating />;

  const [modal, setModal] = useState(false);
  const showModal = () => setModal(true);
  const hideModal = () => {
    setModal(false);
    setNewId("");
    setNewSecret("");
    router.back();
  };

  const [idCopied, setIdCopied] = useState(false);
  const [secretCopied, setSecretCopied] = useState(false);

  const [newId, setNewId] = useState("");
  const copyId = () => {
    Clipboard.setString(newId);
    setIdCopied(true);
  };
  const [newSecret, setNewSecret] = useState("");
  const copySecret = () => {
    Clipboard.setString(newSecret);
    setSecretCopied(true);
  };

  const styles: {
    view: any;
    textInput: any;
    modal: any;
    modalView: any;
    modalText: any;
    mainButtons: any;
    okButton: any;
    bold: any;
    mono: any;
  } = {
    view: {
      margin: 20,
      width: "90%"
    },
    textInput: {
      marginTop: 5,
      marginBottom: 5
    },
    modal: {
      backgroundColor: theme.colors.background,
      margin: 40,
      marginTop: 290,
      marginBottom: 290,
      padding: 20,
      borderRadius: 20
    },
    modalView: {
      alignItems: "center"
    },
    modalText: {
      marginBottom: 10
    },
    mainButtons: {
      width: "95%",
      marginTop: 15
    },
    okButton: {
      width: "75%",
      marginTop: 15
    },
    bold: {
      fontWeight: "bold"
    },
    mono: {
      fontWeight: "NotoSansMono_400Regular"
    }
  };

  const handleSuccess = ({ id, secret }: ModelsCreatedClient) => {
    haptic("notificationSuccess");
    setNewId(id);
    setNewSecret(secret);
    showModal();
  };
  const handleErr = (err: any) => {
    haptic("notificationError");
    console.error(err);
  };
  const handleAdd = () => {
    if (!data) {
      return;
    }
    const { server } = data;

    startLoading();

    server.create
      .oauth2(newClient)
      .then(handleSuccess)
      .catch(handleErr)
      .finally(stopLoading);
  };

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPressIn={handleTouch} onPress={router.back} />
        <Appbar.Content title="Create OAuth2 Client" />
      </Appbar.Header>

      <CustomView>
        <View style={styles.view}>
          <TextInput
            mode="outlined"
            label="Name"
            style={styles.textInput}
            value={newClient.name}
            disabled={loading}
            onChangeText={setName}
          />

          <TextInput
            mode="outlined"
            label="Description"
            style={{ ...styles.textInput, marginBottom: 20 }}
            value={newClient.description}
            disabled={loading}
            onChangeText={setDesc}
          />

          {loading ? (
            loadingText
          ) : (
            <ButtonContainer>
              <Button
                mode="contained-tonal"
                onPressIn={handleTouch}
                onPress={router.back}
                disabled={loading}
                style={{ marginRight: 10 }}
              >
                Cancel
              </Button>

              <Button
                mode="contained"
                onPressIn={handleTouch}
                disabled={loading || !newClient.name}
                onPress={handleAdd}
              >
                Create Client
              </Button>
            </ButtonContainer>
          )}
        </View>
      </CustomView>

      <Portal>
        <Modal style={styles.modal} visible={modal} dismissable={false}>
          <View style={styles.modalView}>
            <Text variant="bodyLarge" style={styles.modalText}>
              Store your new client credentials in a safe place. You won't be
              able to access the client secret again!
            </Text>

            <Button
              mode="contained"
              style={styles.mainButtons}
              disabled={idCopied}
              onPressIn={handleTouch}
              onPress={copyId}
            >
              {idCopied ? "Copied" : "Copy Client ID"}
            </Button>

            <Button
              mode="contained"
              style={styles.mainButtons}
              disabled={secretCopied}
              onPressIn={handleTouch}
              onPress={copySecret}
            >
              {secretCopied ? "Copied" : "Copy Client Secret"}
            </Button>

            <Button
              mode="contained-tonal"
              style={styles.okButton}
              disabled={!secretCopied}
              onPressIn={handleTouch}
              onPress={hideModal}
            >
              Close
            </Button>
          </View>
        </Modal>
      </Portal>
    </>
  );
}
