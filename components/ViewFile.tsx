import expandPath from "@/expandPath";
import Panel from "@/util/Panel";
import haptic from "@/util/haptic";
import SSHClient, { LsResult } from "@dylankenneally/react-native-ssh-sftp";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import {
  ActivityIndicator,
  Icon,
  List,
  Modal,
  Portal,
  Text,
  useTheme
} from "react-native-paper";
import Notice from "./Notice";
import { storage } from "@/util/storage";

interface ViewFileProps {
  file: LsResult;
  currentPath: string[];
  setPath: React.Dispatch<React.SetStateAction<string[]>>;
  setRefresh: React.Dispatch<React.SetStateAction<number>>;
}

const ViewFile = ({
  file,
  currentPath,
  setPath,
  setRefresh
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

  const [visible, setVisible] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { id } = useLocalSearchParams();
  const panel = Panel.getPanel();

  const handleDelete = () => {
    const fullPath = expandPath(currentPath) + file.filename;

    if (!file.isDirectory) {
      panel.get.server(id as string).then(({ server }) => {
        const url = storage.getString(id + "_overrideUrl") || server.node.publicHost;
        const port = Number(storage.getString(id + "_overridePort") || server.node.sftpPort);
        const { email, password } = Panel.getSettings();
        const username = email + "|" + id;

        SSHClient.connectWithPassword(
          url,
          port,
          username,
          password
        )
          .then(client => {
            client.sftpRm(fullPath)
              .then(() => {
                haptic("notificationSuccess");
                setRefresh(Math.random());
              })
              .catch(() => haptic("notificationError"))
              .finally(() => {
                setDeleting(false);
                client.disconnect();
              })
          })
          .catch(() => {
            haptic("notificationError");
            setDeleting(false);
          });
      })

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

  return (
    <>
      <List.Item
        title={file.filename}
        description={file.isDirectory ? "Folder" : computeFileSize()}
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


      <Portal>
        <Modal
          visible={visible}
          contentContainerStyle={{
            backgroundColor: theme.colors.background,
            margin: 20,
            padding: 20,
            borderRadius: 20
          }}
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

            <List.Item
              title={
                <Text style={{ color: theme.colors.surfaceDisabled }}>
                  Edit Name
                </Text>
              }
              left={() => (
                <List.Icon color={theme.colors.surfaceDisabled} icon="pencil" />
              )}
            />

            <List.Item
              title={
                <Text style={{ color: theme.colors.surfaceDisabled }}>
                  Download
                </Text>
              }
              left={() => (
                <List.Icon
                  color={theme.colors.surfaceDisabled}
                  icon="download"
                />
              )}
            />

            {deleting ? (
              <ActivityIndicator animating />
            ) : (
              <List.Item
                title="Delete"
                left={() => <List.Icon icon="trash-can" />}
                onPress={() => {
                  setDeleting(true);
                  handleDelete();
                }}
              />
            )}
          </List.Section>
        </Modal>
      </Portal>
    </>
  );
};

export default ViewFile;
