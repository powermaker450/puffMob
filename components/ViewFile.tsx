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

import expandPath from "@/expandPath";
import Panel from "@/util/Panel";
import haptic from "@/util/haptic";
import SSHClient, { LsResult } from "@dylankenneally/react-native-ssh-sftp";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";
import {
  ActivityIndicator,
  Button,
  Dialog,
  Icon,
  List,
  Modal,
  Portal,
  Text,
  TextInput,
  useTheme
} from "react-native-paper";

interface ViewFileProps {
  file: LsResult;
  currentPath: string[];
  setPath: React.Dispatch<React.SetStateAction<string[]>>;
  setRefresh: React.Dispatch<React.SetStateAction<number>>;
  client: SSHClient | null;
  disableNav: boolean;
}

const ViewFile = ({
  file,
  currentPath,
  setPath,
  setRefresh,
  client,
  disableNav
}: ViewFileProps) => {
  const theme = useTheme();
  const computeFileSize = () =>
    file.fileSize === 4096
      ? "Empty"
      : file.fileSize < 1_000_000
        ? (file.fileSize / 1000).toFixed(2) + " KB"
        : (file.fileSize / 1_000_000).toFixed(2) + " MB";

  const fileType = (): string => {
    if (file.isDirectory) {
      return "folder";
    }

    const { filename } = file;
    const isArchive =
      filename.endsWith(".zip") ||
      filename.endsWith(".tar") ||
      filename.endsWith(".gz");

    if (filename.endsWith(".properties") || filename.endsWith(".toml")) {
      return "file-cog";
    }

    if (filename.endsWith(".txt")) {
      return "text-box";
    }

    if (filename.endsWith(".log")) {
      return "file-chart";
    }

    if (filename.endsWith(".jar")) {
      return "language-java";
    }

    if (filename.endsWith(".json")) {
      return "code-json";
    }

    if (isArchive) {
      return "zip-box";
    }

    return "file-outline";
  };

  const loadingIcon = <ActivityIndicator animating />;

  const [visible, setVisible] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteVis, setDeleteVis] = useState(false);

  const [renameVis, setRenameVis] = useState(false);

  // Replace trailing slash for directories
  const [newName, setNewName] = useState(file.filename.replace("/", ""));
  const [nameUpdating, setNameUpdating] = useState(false);

  // Matches these characters:
  //
  // /
  // <
  // >
  // :
  // "
  // \
  // |
  // ?
  // *
  const invalidChars = /\/|<|>|:|\"|\\|\||\?|\*/g;

  const { id } = useLocalSearchParams();
  const panel = Panel.getPanel();

  const handleDelete = () => {
    const fullPath = expandPath(currentPath) + file.filename;

    if (!file.isDirectory) {
      if (!client) {
        haptic("notificationError");
        setDeleting(false);
        return;
      }

      client
        .sftpRm(fullPath)
        .then(() => {
          setVisible(false);
          haptic("notificationSuccess");
          setRefresh(Math.random());
        })
        .catch(() => haptic("notificationError"))
        .finally(() => setDeleting(false));

      return;
    }

    panel.delete
      .file(id as string, fullPath)
      .then(() => {
        haptic("notificationSuccess");
        setRefresh(Math.random());
      })
      .catch(() => haptic("notificationError"))
      .finally(() => setDeleting(false));
  };

  const cancelRename = () => {
    setRenameVis(false);
    setNewName(file.filename.replace("/", ""));
  };

  const cancelDelete = () => {
    setDeleteVis(false);
  };

  const handleRename = () => {
    setNameUpdating(false);

    const oldPath = expandPath(currentPath) + file.filename;
    const newPath = expandPath(currentPath) + newName;

    if (!client) {
      setNameUpdating(false);
      haptic("notificationError");
      return;
    }

    client
      .sftpRename(oldPath, newPath)
      .then(() => {
        setRenameVis(false);
        haptic("notificationSuccess");
        setRefresh(Math.random());
      })
      .catch(() => haptic("notificationError"))
      .finally(() => setNameUpdating(false));
  };

  const modalStyle = {
    backgroundColor: theme.colors.background,
    margin: 20,
    padding: 20,
    borderRadius: 20
  };

  const longPressModal = (
    <Modal
      visible={visible}
      contentContainerStyle={modalStyle}
      onDismiss={() => setVisible(false)}
    >
      <List.Section>
        <View style={{ alignItems: "center", marginBottom: 30 }}>
          <Icon source={fileType()} size={40} />
          <Text
            variant="titleLarge"
            style={{ marginTop: 10, fontWeight: "bold" }}
          >
            {file.filename}
          </Text>
        </View>

        {nameUpdating ? (
          loadingIcon
        ) : (
          <List.Item
            title="Edit Name"
            left={() => <List.Icon icon="pencil" />}
            onPress={() => setRenameVis(true)}
          />
        )}

        <List.Item
          title={
            <Text style={{ color: theme.colors.surfaceDisabled }}>
              Download
            </Text>
          }
          left={() => (
            <List.Icon color={theme.colors.surfaceDisabled} icon="download" />
          )}
        />

        {deleting ? (
          loadingIcon
        ) : (
          <List.Item
            title="Delete"
            left={() => <List.Icon icon="trash-can" />}
            onPress={() => setDeleteVis(true)}
          />
        )}
      </List.Section>
    </Modal>
  );

  // The newName can go rogue if this is not a function.
  const renameDialog = () => (
    <Dialog
      visible={renameVis}
      onDismiss={cancelRename}
      dismissable={!nameUpdating}
    >
      <Dialog.Title>
        Edit {file.isDirectory ? "Folder" : "File"} Name
      </Dialog.Title>
      <Dialog.Content>
        <TextInput
          mode="outlined"
          label="File Name"
          value={newName}
          onChangeText={text => setNewName(text.replaceAll(invalidChars, ""))}
        />
      </Dialog.Content>

      <Dialog.Actions>
        {!nameUpdating && <Button onPress={cancelRename}>Cancel</Button>}
        {nameUpdating ? (
          loadingIcon
        ) : (
          <Button onPress={handleRename}>Rename</Button>
        )}
      </Dialog.Actions>
    </Dialog>
  );

  const deleteDialog = () => (
    <Dialog
      visible={deleteVis}
      onDismiss={cancelDelete}
      dismissable={!deleting}
    >
      <Dialog.Title>
        Delete{" "}
        {
          <Text style={{ color: theme.colors.primary }}>
            {file.filename.replace("/", "")}
          </Text>
        }
      </Dialog.Title>
      <Dialog.Content>
        <Text variant="bodyMedium">
          Are you sure you want to delete this{" "}
          {file.isDirectory ? "folder" : "file"}?
        </Text>
      </Dialog.Content>

      <Dialog.Actions>
        {!deleting && <Button onPress={cancelDelete}>Cancel</Button>}
        {deleting ? (
          loadingIcon
        ) : (
          <Button onPress={handleDelete}>Delete</Button>
        )}
      </Dialog.Actions>
    </Dialog>
  );

  return (
    <>
      <List.Item
        title={file.filename}
        description={file.isDirectory ? "Folder" : computeFileSize()}
        disabled={disableNav}
        onPress={() =>
          file.isDirectory && setPath(path => path.concat([file.filename]))
        }
        onLongPress={() => {
          haptic();
          setVisible(true);
        }}
        delayLongPress={300}
        left={() => <List.Icon icon={fileType()} style={{ marginLeft: 15 }} />}
        style={{
          backgroundColor: theme.colors.surfaceVariant,
          borderRadius: 20,
          marginTop: 7,
          marginBottom: 7
        }}
      />

      <Portal>{longPressModal}</Portal>

      <Portal>{renameDialog()}</Portal>

      <Portal>{deleteDialog()}</Portal>
    </>
  );
};

export default ViewFile;
