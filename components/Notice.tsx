import { View } from "react-native";
import { Snackbar } from "react-native-paper";

interface NoticeProps {
  condition: boolean;
  setCondition: React.Dispatch<React.SetStateAction<boolean>>;
  text: string;
}

const Notice = ({ condition, setCondition, text }: NoticeProps) => {
  return (
    <View style={{ width: "90%", alignSelf: "center", bottom: 20 }}>
      <Snackbar visible={condition} onDismiss={() => setCondition(false)}>
        {text}
      </Snackbar>
    </View>
  );
};

export default Notice;
