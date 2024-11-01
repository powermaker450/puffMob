import { ReactNode, createContext, useContext, useState } from "react";
import { useColorScheme } from "react-native";

interface ThemeProps {
  children: ReactNode;
}

const ThemeContext = createContext("");

const Theme = ({ children }: ThemeProps) => {
  const [colorScheme, setColorScheme] = useState(useColorScheme());

  return (
    <ThemeContext.Provider value={{ colorScheme, setColorScheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeContext = () => useContext(ThemeContext);
