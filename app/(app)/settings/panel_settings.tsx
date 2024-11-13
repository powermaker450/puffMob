import CustomView from "@/components/CustomView";
import Panel from "@/util/Panel";
import { storage } from "@/util/storage";
import { useEffect } from "react";
import { Text } from "react-native-paper";

export default function panel_settings() {
  const settings = JSON.parse(storage.getString("settings")!);
  const panel = new Panel(settings);

  useEffect(() => {
    panel.get.panelSetting("panel.settings.companyName")
      .then(({ value }) => console.log(value))
      .catch(err => console.log(err));
  })

  return (
    <CustomView>
      <Text>Panel Settings</Text>
    </CustomView>
  );
}
