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
  List,
  Text,
  TextInput
} from "react-native-paper";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { useEffect, useState } from "react";
import Panel from "@/util/Panel";
import SSHClient, { LsResult } from "@dylankenneally/react-native-ssh-sftp";
import ViewFile from "./ViewFile";
import { ScrollView, View } from "react-native";
import ButtonContainer from "./ButtonContainer";
import { handleTouch } from "@/util/haptic";
import { storage } from "@/util/storage";
import PathList from "./PathList";

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
  const expandPath = (pathList: string[]) => {
    let result = "";
    for (const path of pathList) {
      result += path;
    }

    return result;
  }
  const alphabetize = (a: string, b: string) =>
    a < b ? -1 : a > b ? 1 : 0;

  const loadingText = <ActivityIndicator animating />;
  const noFilesFound = (
    <View
      style={{
        width: "85%",
        margin: "auto",
        flex: 1
      }}
    >
      <Text variant="bodyLarge" style={{ textAlign: "center" }} >Your server feels very empty...</Text>
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

      const handleError = (err: any) => {
        setError(true);
        console.log(`Failed to connect to sftp://${username}@${url}:${port}`, err);
      }

      SSHClient.connectWithPassword(
        url,
        port,
        username,
        password
      ).then(client => {

        client
          .sftpLs(expandPath(pathList))
          .then(res => {
            console.log(`Connected to sftp://${username}@${url}:${port}`);
            const dirs = res.filter(file => file.isDirectory);
            dirs.sort((a, b) => alphabetize(a.filename, b.filename));

            const files = res.filter(file => !file.isDirectory);
            files.sort((a, b) => alphabetize(a.filename, b.filename));

            setFileList([...dirs, ...files]);
            setLoading(false);


            navigation.addListener("beforeRemove", () => {
              client.disconnect();
              console.log(`Disconnected from sftp://${username}@${url}:${port}`);
            });
          })
          .catch(err => handleError(err));
      })
      .catch(err => handleError(err));
    });
  }, [retry, pathList]);

  return (
    <>
      {!error && <PathList pathList={pathList} setPath={setPathList} /> }

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
              return <ViewFile key={index} file={file} setPath={setPathList} />;
            })}
          </List.Section>
        )}
      </ScrollView>
    </>
  );
};

export default FilesPage;
