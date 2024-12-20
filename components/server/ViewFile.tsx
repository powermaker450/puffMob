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

import expandPath from "@/util/expandPath";
import haptic, { handleTouch } from "@/util/haptic";
import SSHClient, { LsResult } from "@dylankenneally/react-native-ssh-sftp";
import { useState } from "react";
import { View } from "react-native";
import {
  ActivityIndicator,
  Appbar,
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
import CodeEditor from "@rivascva/react-native-code-editor";
import {
  cacheDirectory,
  getInfoAsync,
  readAsStringAsync,
  writeAsStringAsync
} from "expo-file-system";
import editableFiles from "@/util/editableFiles";
import { Languages } from "@rivascva/react-native-code-editor/lib/typescript/languages";
import { useKeyboard } from "@react-native-community/hooks";
import determineFileType from "@/util/determineFileType";
import invalidChars from "@/util/invalidChars";
import { useServer } from "@/contexts/ServerProvider";

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
  const keyboard = useKeyboard();
  const computeFileSize = () =>
    file.fileSize === 4096
      ? "Empty"
      : file.fileSize < 1_000_000
        ? (file.fileSize / 1000).toFixed(2) + " KB"
        : (file.fileSize / 1_000_000).toFixed(2) + " MB";

  const isEditable = (): boolean => {
    if (file.isDirectory) {
      return false;
    }

    const { filename } = file;

    for (const filetype of editableFiles) {
      if (filename.endsWith(filetype)) {
        return true;
      }
    }

    return false;
  };

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
  const showDialog = () => {
    haptic();
    setVisible(true);
  };
  const hideDialog = () => setVisible(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteVis, setDeleteVis] = useState(false);

  const [renameVis, setRenameVis] = useState(false);

  // Replace trailing slash for directories
  const [newName, setNewName] = useState(file.filename.replace("/", ""));
  const changeNewName = (newText: string) =>
    setNewName(newText.replaceAll(invalidChars, ""));
  const [nameUpdating, setNameUpdating] = useState(false);

  const [editor, setEditor] = useState(false);
  const [codeLanguage, setCodeLanguage] = useState<Languages>("shell");
  const [prevText, setPrevText] = useState("");
  const [editorText, setEditorText] = useState("");
  const changeEditorText = (newText: string) => setEditorText(newText);
  const [downloading, setDownloading] = useState(false);
  const [saving, setSaving] = useState(false);

  const { data } = useServer();

  const handleDelete = () => {
    if (!data) {
      return;
    }
    const { server } = data;

    setDeleting(true);
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
          setDeleteVis(false);
          haptic("notificationSuccess");
          setRefresh(Math.random());
        })
        .catch(() => haptic("notificationError"))
        .finally(() => setDeleting(false));

      return;
    }

    server.delete
      .file(fullPath)
      .then(() => {
        setVisible(false);
        setDeleteVis(false);
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

  const handleDownload = () => {
    if (!cacheDirectory) {
      haptic("notificationError");
      console.error("File download error: documentDirectory is not defined");
      return;
    }

    setDownloading(true);
    const path = expandPath(currentPath) + file.filename;
    const internalPath = cacheDirectory.replace("file://", "");

    if (!client) {
      haptic("notificationError");
      return;
    }

    const handleContent = (content: string) => {
      setCodeLanguage(determineFileType(file.filename));
      setPrevText(content);
      setEditorText(content);
      setEditor(true);
      setDownloading(false);
    };

    const handleErr = (err: any) => {
      haptic("notificationError");
      console.log(err);
    };

    const handleNotCached = (err?: any) => {
      err && console.error("Reading file failed due to:", err);
      console.log(`Downloading "${path}" to "${internalPath}"`);

      client
        .sftpDownload(path, internalPath.substring(0, internalPath.length - 1))
        .then(dlPath => {
          readAsStringAsync("file://" + dlPath)
            .then(handleContent)
            .catch(handleErr);
        })
        .catch(handleErr);
    };

    getInfoAsync("file://" + internalPath + file.filename, { size: true })
      .then(info => {
        // Why is expo-file-system not properly typed? I have no idea. This field exists... for now.
        // I guess i'll f-around and find out.
        //
        // @ts-ignore
        info.size === file.fileSize
          ? readAsStringAsync("file://" + internalPath + file.filename)
              .then(handleContent)
              .catch(handleNotCached)
          : handleNotCached();
      })
      .catch(handleNotCached);
  };

  const handleSave = () => {
    setSaving(true);

    if (!client) {
      haptic("notificationError");
      setSaving(false);
      return;
    }

    const serverPath = expandPath(currentPath);
    const filePath = cacheDirectory + file.filename;
    const handleErr = (err: any) => {
      haptic("notificationError");
      setSaving(false);
      console.error(err);
    };

    writeAsStringAsync(filePath, editorText)
      .then(() => {
        client
          .sftpUpload(filePath.replace("file://", ""), serverPath)
          .then(() => {
            setPrevText(editorText);
            setRefresh(Math.random());
            haptic("notificationSuccess");
          })
          .catch(err => handleErr(err))
          .finally(() => setSaving(false));
      })
      .catch(err => handleErr(err));
  };

  const handleClick = () =>
    file.isDirectory
      ? setPath(path => path.concat([file.filename]))
      : showDialog();

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

        {downloading
          ? loadingIcon
          : isEditable() && (
              <List.Item
                title="Edit File"
                left={() => <List.Icon icon="file-edit" />}
                onPress={handleDownload}
              />
            )}

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
          onChangeText={changeNewName}
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

  const codeEditor = (
    <>
      <Appbar.Header>
        <Appbar.BackAction
          onPressIn={handleTouch}
          onPress={() => {
            setEditor(false);
            setEditorText("");
            setPrevText("");
            setCodeLanguage("shell");
          }}
          color={prevText !== editorText ? theme.colors.surfaceDisabled : ""}
          disabled={prevText !== editorText}
        />
        <Appbar.Content title={file.filename} />

        {saving ? (
          loadingIcon
        ) : (
          <Appbar.Action
            icon="content-save"
            color={prevText === editorText ? theme.colors.surfaceDisabled : ""}
            disabled={prevText === editorText}
            onPress={handleSave}
            onPressIn={handleTouch}
          />
        )}
      </Appbar.Header>

      <CodeEditor
        style={{
          ...{
            fontFamily: "NotoSansMono_400Regular",
            fontSize: 14,
            inputLineHeight: 17,
            highlighterLineHeight: 17
          },
          ...(keyboard.keyboardShown
            ? { marginBottom: keyboard.keyboardHeight / 4 }
            : {})
        }}
        language={codeLanguage}
        initialValue={editorText}
        onChange={changeEditorText}
        showLineNumbers
      />
    </>
  );

  return (
    <>
      <List.Item
        title={file.filename}
        description={file.isDirectory ? "Folder" : computeFileSize()}
        disabled={disableNav}
        onPress={handleClick}
        onLongPress={showDialog}
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

      <Portal>{editor && codeEditor}</Portal>
    </>
  );
};

export default ViewFile;
