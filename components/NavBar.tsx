import { handleTouch } from "@/util/haptic";
import { BottomNavigation, BottomNavigationRoute } from "react-native-paper"

const exampleScene = BottomNavigation.SceneMap({});

interface NavBarProps {
  state: { index: number, routes: BottomNavigationRoute[] };
  onIndexChange: React.Dispatch<React.SetStateAction<number>>;
  renderScene: typeof exampleScene;
}

const NavBar = ({ state, onIndexChange, renderScene }: NavBarProps) => {
  return (
    <BottomNavigation
      navigationState={state}
      onIndexChange={onIndexChange}
      onTabPress={handleTouch}
      sceneAnimationType="shifting"
      sceneAnimationEnabled
      renderScene={renderScene}
    />
  )
}

export default NavBar;
