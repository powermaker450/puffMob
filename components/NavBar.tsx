import { handleTouch } from "@/util/haptic";
import { useState } from "react";
import { BottomNavigation, BottomNavigationRoute } from "react-native-paper"

const exampleScene = BottomNavigation.SceneMap({});

interface NavBarProps {
  routes: BottomNavigationRoute[];
  renderScene: typeof exampleScene;
}

const NavBar = ({ routes, renderScene }: NavBarProps) => {
  const [index, setIndex] = useState(0);

  return (
    <BottomNavigation
      navigationState={{ index, routes }}
      onIndexChange={setIndex}
      onTabPress={handleTouch}
      sceneAnimationType="shifting"
      sceneAnimationEnabled
      renderScene={renderScene}
    />
  )
}

export default NavBar;
