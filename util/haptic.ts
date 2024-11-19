/*
 * puffMob: A mobile client for Pufferpanel
 * Copyright (C) 2024 powermaker450
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

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
}

export const handleTouch = () => haptic();
