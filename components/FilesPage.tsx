import { ActivityIndicator, Button, List, Text, TextInput } from "react-native-paper";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { useEffect, useState } from "react";
import Panel from "@/util/Panel";
import SSHClient, { LsResult } from "@dylankenneally/react-native-ssh-sftp";
import ViewFile from "./ViewFile";
import { ScrollView, View } from "react-native";
import ButtonContainer from "./ButtonContainer";
import { handleTouch } from "@/util/haptic";
import { storage } from "@/util/storage";

const FilesPage = () => {
  const { id } = useLocalSearchParams();
  const navigation = useNavigation();
  const { email, password } = Panel.getSettings();
  const panel = Panel.getPanel();

  const [overrideUrl, setOverrideUrl] = useState(storage.getString(id + "_overrideUrl") || "");
  const [overridePort, setOverridePort] = useState(storage.getString(id + "_overridePort") || "5657");
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  const [loading, setLoading] = useState(true);
  const [fileList, setFileList] = useState<LsResult[]>([]);
  const sortingFunction = (a: string, b: string) => a < b ? -1 : a > b ? 1 : 0;

  const loadingText = <ActivityIndicator animating />;
  const errorText = (
    <View style={{ maxWidth: "85%", margin: "auto" }}>   
      <Text variant="displaySmall" style={{ marginBottom: 15 }}>An error occured.</Text>

      <Text
        variant="bodyLarge"
        style={{ marginBottom: 30 }}
      >
        Make sure the SFTP ports are properly configured and forwarded.
      </Text>

      <Text
        variant="bodyLarge"
        style={{ marginBottom: 15 }}
      >
        Additionally, the SFTP server may not be running on the main node. You can enter the server address if you know it here.
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
          disabled={!overrideUrl.match(/[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}/)}
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
    panel.get.server(id as string).then(({ server }) => {
      SSHClient.connectWithPassword(
        overrideUrl || server.node.publicHost,
        Number(overridePort) === server.node.sftpPort ? server.node.sftpPort : Number(overridePort),
        `${email}|${id}`, password
      ).then(client => {
        client.sftpLs(".").then(res => {
          const dirs = res.filter(file => file.isDirectory);
          dirs.sort((a, b) => sortingFunction(a.filename, b.filename));

          const files = res.filter(file => !file.isDirectory);
          files.sort((a, b) => sortingFunction(a.filename, b.filename));

          setFileList([...dirs, ...files]);
          setLoading(false);
        })
        .catch(() => setError(true));

        navigation.addListener("beforeRemove", () => client.disconnectSFTP());
      });
    });
  }, [retry]);

  return (
    <ScrollView>
      {loading
        ? error ? errorText : loadingText
        : !fileList.length
          ? <Text>No files were found.</Text>
          : <List.Section style={{ width: "95%", margin: "auto" }}>
              { fileList.map((file, index) => {
                return <ViewFile key={index} file={file} />
              }) }
            </List.Section>
      }
    </ScrollView>
  );
}

export default FilesPage;
