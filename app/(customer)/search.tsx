import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

export default function SearchScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.container}>
        <Ionicons name="search-outline" size={48} color="#ccc" />
        <Text style={styles.title}>Search</Text>
        <Text style={styles.subtitle}>Advanced search coming soon</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f5f0ff" },
  container: { flex: 1, justifyContent: "center", alignItems: "center", gap: 10 },
  title: { fontSize: 20, fontWeight: "700", color: "#1a1a1a" },
  subtitle: { fontSize: 14, color: "#888" },
});
