import { ModelsServerView } from "@/util/models";
import { List } from "react-native-paper";

interface ServerProps {
  name: string;
  ip: string;
  port: number;
}

export default function Server({ name, ip, port }: ServerProps) {
  return (
    <List.Item
      title={name}
      description={ip + ":" + port}
      left={() => <List.Icon icon="server" />}
    >
    </List.Item>
  )
}
