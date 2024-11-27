import { LsResult } from "@dylankenneally/react-native-ssh-sftp";
import { List, useTheme } from "react-native-paper";

interface ViewFileProps {
  file: LsResult;
  setPath: React.Dispatch<React.SetStateAction<string[]>>;
}

const ViewFile = ({ file, setPath }: ViewFileProps) => {
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
    const isArchive = filename.endsWith(".zip") || filename.endsWith(".tar") || filename.endsWith(".gz");

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

  return (
    <List.Item
      title={file.filename}
      description={file.isDirectory ? "Folder" : computeFileSize()}
      onPress={() => file.isDirectory && setPath(path => path.concat([file.filename]))}
      left={() => <List.Icon icon={fileType()} style={{ marginLeft: 15 }} />}
      style={{
        backgroundColor: theme.colors.surfaceVariant,
        borderRadius: 20,
        marginTop: 7,
        marginBottom: 7
      }}
    />
  );
};

export default ViewFile;
