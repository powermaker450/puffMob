import { Languages } from "@rivascva/react-native-code-editor/lib/typescript/languages";

interface LanguageType {
  extensions: string[];
  literalType: Languages;
}

const languageTypes: LanguageType[] = [
  {
    extensions: ["json"],
    literalType: "json"
  },
  {
    extensions: ["sh"],
    literalType: "shell"
  },
  {
    extensions: ["ps", "bat"],
    literalType: "powershell"
  }
];

export default function determineFileType(filename: string): Languages {
  for (const { extensions, literalType } of languageTypes) {
    for (const extension of extensions) {
      if (filename.endsWith(extension)) {
        return literalType;
      }
    }
  }

  return "shell";
}
