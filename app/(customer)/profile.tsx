import { useClerk } from "@clerk/clerk-expo";
import { useQuery } from "convex/react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";


const PURPLE = "#7c3aed";

export default function ProfileScreen() {
  const { signOut } = useClerk();
  const user = useQuery("users:getMe" as any);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.avatarWrap}>
          {user?.avatarUrl ? (
            <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
          ) : (
            <Ionicons name="person" size={40} color="#fff" />
          )}
        </View>
        <Text style={styles.name}>{user?.name ?? "Customer"}</Text>
        <Text style={styles.email}>{user?.email ?? ""}</Text>

        <TouchableOpacity
          style={styles.signOutBtn}
          onPress={() => signOut()}
          accessibilityRole="button"
          accessibilityLabel="Sign out"
        >
          <Ionicons name="log-out-outline" size={18} color="#fff" />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f5f0ff" },
  container: { flex: 1, alignItems: "center", justifyContent: "center", gap: 8 },
  avatarWrap: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: PURPLE,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    overflow: "hidden",
  },
  avatar: { width: 90, height: 90 },
  name: { fontSize: 20, fontWeight: "700", color: "#1a1a1a" },
  email: { fontSize: 14, color: "#888" },
  signOutBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 24,
    backgroundColor: "#ef4444",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  signOutText: { color: "#fff", fontWeight: "600", fontSize: 15 },
});
