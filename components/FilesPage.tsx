import { List, Text } from "react-native-paper";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { useEffect, useState } from "react";
import Panel from "@/util/Panel";
import SSHClient, { LsResult } from "@dylankenneally/react-native-ssh-sftp";
import ViewFile from "./ViewFile";
import { ScrollView } from "react-native";

const FilesPage = () => {
  const { id } = useLocalSearchParams();
  const navigation = useNavigation();
  const { email, password } = Panel.getSettings();
  const panel = Panel.getPanel();

  const [loading, setLoading] = useState(true);
  const [fileList, setFileList] = useState<LsResult[]>([]);
  const sortingFunction = (a: string, b: string) => a < b ? -1 : a > b ? 1 : 0;

  useEffect(() => {
    panel.get.server(id as string).then(({ server }) => {
      SSHClient.connectWithPassword(server.node.publicHost, server.node.sftpPort, `${email}|${id}`, password).then(client => {
        client.sftpLs(".").then(res => {
          const dirs = res.filter(file => file.isDirectory);
          dirs.sort((a, b) => sortingFunction(a.filename, b.filename));

          const files = res.filter(file => !file.isDirectory);
          files.sort((a, b) => sortingFunction(a.filename, b.filename));

          setFileList([...dirs, ...files]);
          setLoading(false);
        });

        navigation.addListener("beforeRemove", () => client.disconnectSFTP());
      });
    });
  }, []);

  return (
    <ScrollView>
      <List.Section style={{ width: "95%", margin: "auto" }}>
        {loading ? <Text>Loading...</Text> : !fileList.length ? <Text>No files were found.</Text> : fileList.map((file, index) => {
          return <ViewFile key={index} file={file} />
        })}
      </List.Section>
    </ScrollView>
  );
}

export default FilesPage;
