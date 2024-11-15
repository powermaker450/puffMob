import { handleTouch } from "@/util/haptic";
import { View } from "react-native";
import { Snackbar } from "react-native-paper";

interface UnsavedChangesProps {
  condition: boolean;
  reset: () => void;
}

const UnsavedChanges = ({ condition, reset }: UnsavedChangesProps) => {
  return (
    <View style={{ width: "90%", alignSelf: "center", bottom: 20 }}>
      <Snackbar
        visible={condition}
        duration={Infinity}
        onDismiss={reset}
        action={{
          label: "Discard",
          onPressIn: handleTouch,
          onPress: reset
        }}
      >
        You have unsaved changes.
      </Snackbar>
    </View>
  );
};

export default UnsavedChanges;
