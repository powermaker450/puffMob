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

import {
  ActivityIndicator,
  Button,
  Dialog,
  FAB,
  List,
  Portal,
  Text,
  TextInput
} from "react-native-paper";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { useEffect, useState } from "react";
import Panel from "@/util/Panel";
import SSHClient, {
  LsResult,
} from "@dylankenneally/react-native-ssh-sftp";
import ViewFile from "./ViewFile";
import { ScrollView, View } from "react-native";
import ButtonContainer from "../ButtonContainer";
import haptic, { handleTouch } from "@/util/haptic";
import { storage } from "@/util/storage";
import PathList from "./PathList";
import expandPath from "@/util/expandPath";
import { cacheDirectory, deleteAsync, writeAsStringAsync } from "expo-file-system";
import invalidChars from "@/util/invalidChars";

const FilesPage = () => {
  const { id } = useLocalSearchParams();
  const navigation = useNavigation();
  const { email, password } = Panel.getSettings();
  const panel = Panel.getPanel();

  const [overrideUrl, setOverrideUrl] = useState(
    storage.getString(id + "_overrideUrl") || ""
  );
  const [overridePort, setOverridePort] = useState(
    storage.getString(id + "_overridePort") || ""
  );
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  const [loading, setLoading] = useState(true);
  const [fileList, setFileList] = useState<LsResult[]>([]);
  const [pathList, setPathList] = useState<string[]>(["./"]);

  const [disableNav, setDisableNav] = useState(false);

  const [client, setClient] = useState<SSHClient | null>(null);
  const alphabetize = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);
  const handleError = (err: any) => {
    setError(true);
    console.log(`Failed to connect to sftp:`, err);
  };

  // Create file stuff

  const [fabState, setFabState] = useState({ open: false });

  const onFabStateChange = ({ open }: { open: boolean }) => setFabState({ open });
  const { open } = fabState;
  const [createDiag, setCreateDiag] = useState(false);
  const openCreateFile = () => {
    setFileType("file");
    setCreateDiag(true);
  }
  const openCreateFolder = () => {
    setFileType("folder");
    setCreateDiag(true);
  }
  const closeCreateDiag = () => setCreateDiag(false);

  const [filename, setFilename] = useState("");
  const [fileType, setFileType] = useState<"file" | "folder">("file");

  const handleCreate = () => {
    if (!client) {
      haptic("notificationError");
      return;
    }

    const handleComplete = () => {
      closeCreateDiag();
      haptic("notificationSuccess");
      setRetry(Math.random());
      setFilename("");
    }

    const handleErr = (err: any) => {
      haptic("notificationError");
      console.error(err);
    }

    if (fileType === "file") {
      const f = filename + ".txt";
      const location = cacheDirectory + f;
      const remoteLocation = expandPath(pathList);

      writeAsStringAsync(location, "")
        .then(() => client.sftpUpload(location.replace("file://", ""), remoteLocation)
          .then(() => {
            handleComplete();
            deleteAsync(location)
              .catch(err => handleErr(err));
          })
          .catch(err => handleErr(err))
        )
        .catch(err => handleErr(err));

      return;
    }

    if (fileType === "folder") {
      client.sftpMkdir(expandPath(pathList) + filename)
        .then(handleComplete)
        .catch(err => handleErr(err))

      return;
    }
  }

  const createFileDialog = (
    <Dialog visible={createDiag} onDismiss={closeCreateDiag}>
      <Dialog.Title>Create {fileType}</Dialog.Title>
      
      <Dialog.Content>
        <TextInput
          mode="outlined"
          label={(fileType === "file" ? "File" : "Folder") + " name"}
          value={filename}
          onChangeText={text => setFilename(text.replace(invalidChars, ""))}
        />
      </Dialog.Content>

      <Dialog.Actions>
        <Button onPress={closeCreateDiag}>Cancel</Button>
        <Button
          onPress={handleCreate}
          disabled={!filename}
        >
          Create {fileType}
        </Button>
      </Dialog.Actions>
    </Dialog>
  );

  const createFileButton = (
    <FAB.Group
      open={open}
      visible={!loading && !error}
      icon={open ? "file-question" : "plus"}
      actions={[
        {
          icon: "file",
          label: "Create File",
          onPress: openCreateFile
        },
        {
          icon: "folder",
          label: "Create Folder",
          onPress: openCreateFolder
        }
      ]}
      onStateChange={onFabStateChange}
      onPress={() => setFabState({ open: !open })}
    />
  );

  // End of the create file menus

  const loadingText = <ActivityIndicator animating />;
  const noFilesFound = (
    <View
      style={{
        width: "85%",
        margin: "auto",
        marginTop: 15,
        flex: 1
      }}
    >
      <Text variant="bodyLarge" style={{ textAlign: "center" }}>
        Your folder feels very empty...
      </Text>
    </View>
  );
  const errorText = (
    <View style={{ maxWidth: "85%", margin: "auto", marginTop: 30 }}>
      <Text variant="displaySmall" style={{ marginBottom: 15 }}>
        An error occured.
      </Text>

      <Text variant="bodyLarge" style={{ marginBottom: 30 }}>
        Make sure the SFTP ports are properly configured and forwarded.
      </Text>

      <Text variant="bodyLarge" style={{ marginBottom: 15 }}>
        Additionally, the SFTP server may not be running on the main node. You
        can enter the server address if you know it here.
      </Text>

      <View style={{ flex: 1, marginBottom: 30 }}>
        <TextInput
          mode="outlined"
          style={{ marginBottom: 10 }}
          label="SFTP URL"
          value={overrideUrl}
          onChangeText={text => setOverrideUrl(text)}
        />

        <TextInput
          mode="outlined"
          label="Port"
          value={overridePort}
          onChangeText={text => setOverridePort(text.replaceAll(/\D+/g, ""))}
        />
      </View>

      <ButtonContainer>
        <Button
          onPressIn={handleTouch}
          onPress={() => {
            setError(false);
            setLoading(true);
            setRetry(Math.random());
          }}
          mode="contained-tonal"
          disabled={
            !overrideUrl.match(/[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}/)
          }
        >
          Retry
        </Button>
      </ButtonContainer>
    </View>
  );


  useEffect(() => {
    storage.set(id + "_overrideUrl", overrideUrl);
  }, [overrideUrl]);

  useEffect(() => {
    storage.set(id + "_overridePort", overridePort);
  }, [overridePort]);

  useEffect(() => {
    setLoading(true);

    panel.get.server(id as string).then(({ server }) => {
      const url = overrideUrl || server.node.publicHost;
      const port = overridePort ? Number(overridePort) : server.node.sftpPort;
      const username = email + "|" + id;

      SSHClient.connectWithPassword(url, port, username, password)
        .then(client => {
          console.log(`Connected to sftp://${url}:${port}@${username}`);
          setClient(client);

          navigation.addListener("beforeRemove", () => {
            client && client.disconnect();
            console.log(`Disconnected from sftp://${url}:${port}@${username}`);
          });
        })
        .catch(err => handleError(err));
    });
  }, []);

  useEffect(() => {
    if (client) {
      setDisableNav(true);

      client
        .sftpLs(expandPath(pathList))
        .then(res => {
          const dirs = res.filter(file => file.isDirectory);
          dirs.sort((a, b) => alphabetize(a.filename, b.filename));

          const files = res.filter(file => !file.isDirectory);
          files.sort((a, b) => alphabetize(a.filename, b.filename));

          setFileList([...dirs, ...files]);
          setLoading(false);
        })
        .catch(err => handleError(err))
        .finally(() => setDisableNav(false));
    }
  }, [client, retry, pathList]);

  return (
    <>
      {!error && <PathList pathList={pathList} setPath={setPathList} />}

      <ScrollView>
        {loading ? (
          error ? (
            errorText
          ) : (
            loadingText
          )
        ) : !fileList.length ? (
          noFilesFound
        ) : (
          <List.Section style={{ width: "95%", margin: "auto" }}>
            {fileList.map((file, index) => {
              return (
                <ViewFile
                  key={index}
                  file={file}
                  setPath={setPathList}
                  currentPath={pathList}
                  setRefresh={setRetry}
                  client={client}
                  disableNav={disableNav}
                />
              );
            })}
          </List.Section>
        )}
      </ScrollView>

      {(!loading && !error) && createFileButton}

      <Portal>{createFileDialog}</Portal>
    </>
  );
};

export default FilesPage;
