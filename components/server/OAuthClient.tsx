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

import { ModelsClient } from "@/util/models";
import { ComponentProps, useState } from "react";
import {
  ActivityIndicator,
  Button,
  Checkbox,
  Dialog,
  Icon,
  List,
  Modal,
  Portal,
  Snackbar,
  Text,
  useTheme
} from "react-native-paper";
import Clipboard from "@react-native-clipboard/clipboard";
import haptic, { handleTouch } from "@/util/haptic";
import { useLocalSearchParams } from "expo-router";
import { usePanel } from "@/contexts/PanelProvider";

interface OAuthClientProps {
  client: ModelsClient;
  refresh: () => void;
}

const OAuthClient = ({ client, refresh }: OAuthClientProps) => {
  const theme = useTheme();
  const { panel } = usePanel();
  const { id } = useLocalSearchParams();

  const [modal, setModal] = useState(false);
  const showModal = () => setModal(true);
  const hideModal = () => setModal(false);

  const [loading, setLoading] = useState(false);
  const startLoading = () => setLoading(true);
  const stopLoading = () => setLoading(false);

  const [dialog, setDialog] = useState(false);
  const showDialog = () => setDialog(true);
  const hideDialog = () => {
    setDialog(false);
    setUnderstood(false);
  };

  const [notice, setNotice] = useState(false);
  const showNotice = () => {
    setNotice(true);
    setTimeout(() => hideNotice(), 1500);
  };
  const hideNotice = () => setNotice(false);

  const [understood, setUnderstood] = useState(false);
  const toggleUnderstood = () => {
    haptic(understood ? "contextClick" : "soft");
    setUnderstood(v => !v);
  };

  const styles: {
    listItem: ComponentProps<(typeof List)["Item"]>["style"];
    modal: ComponentProps<typeof Modal>["style"];
    modalContent: ComponentProps<typeof Modal>["contentContainerStyle"];
    modalButton: ComponentProps<typeof Button>["style"];
    modalDangerButton: ComponentProps<typeof Button>["style"];
    modalTitle: ComponentProps<typeof Text>["style"];
    icon: ComponentProps<(typeof List)["Icon"]>["style"];
    bold: ComponentProps<typeof Text>["style"];
    notice: ComponentProps<typeof Snackbar>["style"];
    checkbox: ComponentProps<(typeof Checkbox)["Item"]>["style"];
  } = {
    listItem: {
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: 20,
      width: "95%",
      margin: "auto",
      marginTop: 7,
      marginBottom: 7
    },
    modal: {
      backgroundColor: theme.colors.background,
      margin: 40,
      marginTop: "75%",
      marginBottom: "75%",
      padding: 20,
      borderRadius: 20
    },
    modalContent: {
      alignItems: "center"
    },
    modalButton: {
      width: "95%",
      marginTop: 15
    },
    modalDangerButton: {
      width: "95%",
      marginTop: 15,
      backgroundColor: theme.colors.error
    },
    modalTitle: {
      fontWeight: "bold",
      marginTop: 10,
      marginBottom: 5
    },
    icon: {
      marginLeft: 15
    },
    bold: {
      fontWeight: "bold"
    },
    notice: {
      width: "90%",
      alignSelf: "center",
      bottom: 20
    },
    checkbox: {
      marginTop: 10,
      alignSelf: "flex-start"
    }
  };

  const clientIcon = () => (
    <List.Icon icon="server-security" style={styles.icon} />
  );
  const handleCopy = () => {
    haptic("rigid");
    showNotice();
    Clipboard.setString(client.client_id);
  };
  const loadingText = <ActivityIndicator animating />;
  const title =
    client.name + (client.description && ` | "${client.description}"`);

  const handleDelete = () => {
    startLoading();

    panel.delete
      .serverOauth2(id as string, client.client_id)
      .then(() => {
        haptic("notificationSuccess");
        hideModal();
        refresh();
      })
      .catch(err => {
        haptic("notificationError");
        console.error(err);
      })
      .finally(() => {
        stopLoading();
        setDialog(false);
      });
  };

  return (
    <>
      <List.Item
        title={title}
        description={client.client_id}
        style={styles.listItem}
        left={clientIcon}
        onPress={showModal}
        onLongPress={handleCopy}
        delayLongPress={300}
      />

      <Portal>
        <Modal
          style={styles.modal}
          visible={modal}
          onDismiss={hideModal}
          contentContainerStyle={styles.modalContent}
        >
          <Icon source="server-security" size={40} />

          <Text variant="titleLarge" style={styles.modalTitle}>
            {client.name}
          </Text>

          <Button
            mode="contained-tonal"
            style={styles.modalButton}
            onPressIn={handleTouch}
            onPress={handleCopy}
          >
            Copy Client ID
          </Button>

          <Button
            mode="contained"
            onPressIn={handleTouch}
            onPress={showDialog}
            style={styles.modalDangerButton}
          >
            Delete Client
          </Button>
        </Modal>
      </Portal>

      <Portal>
        <Dialog visible={dialog} onDismiss={hideDialog}>
          <Dialog.Content>
            <Text style={{ alignSelf: "center" }} variant="bodyLarge">
              Are you sure you want to delete{" "}
              <Text style={styles.bold}>{client.name}</Text>?
            </Text>

            <Checkbox.Item
              label="I understand deleting this client will render any applications using this client inoperable."
              labelVariant="bodyMedium"
              style={styles.checkbox}
              status={understood ? "checked" : "unchecked"}
              onPress={toggleUnderstood}
            />
          </Dialog.Content>

          <Dialog.Actions>
            {loading ? null : (
              <Button onPress={hideDialog} disabled={loading}>
                Cancel
              </Button>
            )}

            {loading ? (
              loadingText
            ) : (
              <Button onPress={handleDelete} disabled={loading || !understood}>
                Delete
              </Button>
            )}
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Portal>
        <Snackbar style={styles.notice} visible={notice} onDismiss={hideNotice}>
          Copied to clipboard!
        </Snackbar>
      </Portal>
    </>
  );
};

export default OAuthClient;
