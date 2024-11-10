import { MMKV } from "react-native-mmkv";

export const storage = new MMKV({
  id: "puffMobStore",
  encryptionKey: "com.povario.puffmob"
});
