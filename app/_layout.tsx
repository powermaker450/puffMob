import { useMaterial3Theme } from "@pchmn/expo-material3-theme";
import { PaperProvider, MD3DarkTheme, MD3LightTheme } from "react-native-paper";
import { Stack } from "expo-router";
import { useColorScheme } from "react-native";

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const { theme } = useMaterial3Theme({ fallbackSourceColor: "#07a7e3" });
  const getColor = () =>
    colorScheme === "dark" ? theme.dark.background : theme.light.background;

  const options = {
    headerShown: false,
    contentStyle: {
      backgroundColor: getColor()
    }
  };

  const paperTheme =
    colorScheme === "dark"
      ? { ...MD3DarkTheme, colors: theme.dark }
      : { ...MD3LightTheme, colors: theme.light };

  return (
    <PaperProvider theme={paperTheme}>
      <Stack screenOptions={options}>
        <Stack.Screen name="index" />
      </Stack>
    </PaperProvider>
  );
}
