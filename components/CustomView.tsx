import { ReactNode } from "react";
import { View } from "react-native";

interface CustomViewProps {
  children: ReactNode;
}

export default function CustomView({ children }: CustomViewProps) {
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {children}
    </View>
  );
}
