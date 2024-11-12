import {
  HapticOptions,
  HapticFeedbackTypes,
  trigger
} from "react-native-haptic-feedback";

const options: HapticOptions = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false
};

const haptic = (
  type: keyof typeof HapticFeedbackTypes | HapticFeedbackTypes = "contextClick"
) => {
  trigger(type, options);
};

export const handleTouch = () => haptic();

export default haptic;
