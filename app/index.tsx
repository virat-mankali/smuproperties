import { ActivityIndicator, View } from "react-native";

// This screen is only briefly visible while the auth navigator
// in _layout.tsx determines where to send the user.
export default function Index() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" />
    </View>
  );
}
