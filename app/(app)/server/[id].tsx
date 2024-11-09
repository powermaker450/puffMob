import CustomView from "@/components/CustomView";
import Panel, { PanelParams } from "@/util/Panel";
import { storage } from "@/util/storage";
import { router, useLocalSearchParams } from "expo-router";
import { useRef, useState } from "react";
import { View } from "react-native";
import { 
  ActivityIndicator,
  Appbar,
  Icon,
  Text,
  Tooltip,
  configureFonts,
  useTheme
} from "react-native-paper";
import { ScrollView } from "react-native";

export default function ServerScreen() {
  const settings: PanelParams = JSON.parse(storage.getString("settings")!);
  const control = new Panel(settings);
  const theme = useTheme();
  const monospace = {
    fontFamily: "'NotoSansMono_400Regular'"
  };

  const { id } = useLocalSearchParams();
  const [serverName, setServerName] = useState("");
  control.get.server(id as string)
    .then(({ server }) => {
      setRunning(server.running);
      setServerName(server.name);
      server.getConsole().then(logs => setLogs(logs));
    });

  const [running, setRunning] = useState<boolean | undefined>(false);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState("");

  const handleStart = () => {
    setLoading(true);
    control.get.server(id as string)
      .then(({ server }) => server.start())
      .catch(err => console.warn("An unexpected error occured:", err))
      .finally(() => {
        setRunning(true);
        setLoading(false);
      });
  }

  const handleStop = () => {
    setLoading(true);
    control.get.server(id as string)
      .then(({ server }) => server.stop())
      .catch(err => console.warn("An unexpected error occured:", err))
      .finally(() => {
        setRunning(false);
        setLoading(false);
      });
  }

  const loadingIcon = (
    <ActivityIndicator animating={true} />
  );

  const startButton = (
    <Tooltip
      title="Start"
      enterTouchDelay={300}
      leaveTouchDelay={150}
    >
      <Appbar.Action icon="play-outline" onPress={handleStart} />
    </Tooltip>
  );

  const stopButton = (
    <Tooltip 
      title="Stop"
      enterTouchDelay={300}
      leaveTouchDelay={150}
    >
      <Appbar.Action icon="stop-circle-outline" onPress={handleStop} />
    </Tooltip>
  );

  const scrollViewRef = useRef<ScrollView>(null);

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Icon source="circle" size={12} color={running ? theme.colors.primary : theme.colors.surfaceDisabled} />
        <Appbar.Content style={{marginLeft: 10}} title={serverName} />

        {loading ? loadingIcon : running ? stopButton : startButton}
      </Appbar.Header>

      <CustomView>
        <View style={{
          backgroundColor: theme.colors.surfaceVariant,
          paddingLeft: 20,
          paddingRight: 20,
          paddingTop: 10,
          paddingBottom: 10,
          width: "85%",
          height: "75%",
          borderRadius: 20
        }}> 
          <ScrollView
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd()}
            ref={scrollViewRef}
          >
            <ScrollView horizontal>
              <Text
                selectable
                style={{ fontSize: 12 }}
                theme={{fonts: configureFonts({config: monospace})}}
              >{logs}</Text>
            </ScrollView>
          </ScrollView>
        </View>
      </CustomView>
    </>
  );
}
