import CustomView from "@/components/CustomView";
import { handleTouch } from "@/util/haptic";
import { router } from "expo-router";
import { useMMKVString } from "react-native-mmkv";
import { Appbar } from "react-native-paper";

export default function appearance() {
  const [userTheme, setUserTheme] = useMMKVString("auto");

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPressIn={handleTouch} onPress={() => router.back()} />
        <Appbar.Content title="Appearance" />
      </Appbar.Header>

      <CustomView>
      </CustomView>
    </>
  );
}
