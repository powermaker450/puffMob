import {
  HapticOptions,
  HapticFeedbackTypes,
  trigger
} from "react-native-haptic-feedback";

const options: HapticOptions = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false
};

/**
 * Triggers a haptic action. With no parameters this triggers a contextClick haptic.
 *
 * @param [type="contextClick"] - The type of haptic to use
 */
export default function haptic(
  type: keyof typeof HapticFeedbackTypes | HapticFeedbackTypes = "contextClick"
) {
  trigger(type, options);
};

export const handleTouch = () => haptic();
