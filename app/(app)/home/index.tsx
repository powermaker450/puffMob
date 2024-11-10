import AccountPage from "@/components/AccountPage";
import ServerPage from "@/components/ServerPage";
import { useState } from "react";
import { BottomNavigation } from "react-native-paper";

export default function home() {
  const NavigationBar = () => {
    const [index, setIndex] = useState(0);
    const [routes] = useState([
      {
        key: "servers",
        title: "Servers",
        focusedIcon: "server"
      },
      {
        key: "settings",
        title: "Settings",
        focusedIcon: "cog"
      }
    ]);

    const renderScene = BottomNavigation.SceneMap({
      servers: ServerPage,
      settings: AccountPage
    });

    return (
      <BottomNavigation
        navigationState={{ index, routes }}
        onIndexChange={setIndex}
        renderScene={renderScene}
      />
    );
  };

  return <NavigationBar />;
}
