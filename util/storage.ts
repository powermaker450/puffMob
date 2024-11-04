import { MMKV } from "react-native-mmkv";

export interface PuffMobSettings {
  endpoint: string;
  clientId: string;
  secret: string;
}

export const storage = new MMKV({
  id: "puffMobStore"
});
