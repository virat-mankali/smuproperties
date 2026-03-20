import { useClerk } from "@clerk/clerk-expo";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function AgentDashboard() {
  const { signOut } = useClerk();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Agent Dashboard</Text>
      <Text style={styles.subtitle}>Your listings and leads will appear here</Text>
      <TouchableOpacity
        style={styles.signOut}
        onPress={() => signOut()}
        accessibilityRole="button"
        accessibilityLabel="Sign out"
      >
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" },
  title: { fontSize: 24, fontWeight: "700", color: "#1a1a1a" },
  subtitle: { fontSize: 16, color: "#666", marginTop: 8 },
  signOut: { marginTop: 32, padding: 12, backgroundColor: "#ef4444", borderRadius: 8 },
  signOutText: { color: "#fff", fontWeight: "600" },
});
