import { ReactNode } from "react"
import { View } from "react-native";

interface ButtonContainerProps {
  children: ReactNode;
}

export default function ButtonContainer({ children }: ButtonContainerProps) {
  return (
    <View
      style={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center"
      }}
    >
      {children}
    </View>
  )
}
