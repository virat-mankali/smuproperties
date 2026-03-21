import { useQuery } from "convex/react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

const PURPLE = "#7c3aed";
const BG = "#f5f0ff";

export default function LeadsScreen() {
  const leads = useQuery("properties:getAgentLeads" as any);

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleEmail = (email: string) => {
    Linking.openURL(`mailto:${email}`);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Leads</Text>
        {leads !== undefined && (
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{(leads as any[]).length}</Text>
          </View>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {leads === undefined ? (
          <ActivityIndicator color={PURPLE} style={{ marginTop: 60 }} />
        ) : (leads as any[]).length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={52} color="#ccc" />
            <Text style={styles.emptyTitle}>No leads yet</Text>
            <Text style={styles.emptySubtitle}>
              Customers who save your listings will appear here
            </Text>
          </View>
        ) : (
          (leads as any[]).map((lead: any) => (
            <View key={lead._id} style={styles.card}>
              {/* Avatar */}
              <View style={styles.avatarWrap}>
                {lead.customerAvatar ? (
                  <Image source={{ uri: lead.customerAvatar }} style={styles.avatar} />
                ) : (
                  <Ionicons name="person" size={22} color="#fff" />
                )}
              </View>

              {/* Info */}
              <View style={styles.info}>
                <Text style={styles.name}>{lead.customerName}</Text>
                <Text style={styles.email} numberOfLines={1}>{lead.customerEmail}</Text>
                <View style={styles.propertyRow}>
                  <Ionicons name="home-outline" size={12} color="#888" />
                  <Text style={styles.propertyTitle} numberOfLines={1}>
                    {lead.propertyTitle}
                  </Text>
                </View>
              </View>

              {/* Actions */}
              <View style={styles.actions}>
                {lead.customerPhone && (
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: "#10b98120" }]}
                    onPress={() => handleCall(lead.customerPhone)}
                    accessibilityRole="button"
                    accessibilityLabel={`Call ${lead.customerName}`}
                  >
                    <Ionicons name="call-outline" size={18} color="#10b981" />
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: "#7c3aed20" }]}
                  onPress={() => handleEmail(lead.customerEmail)}
                  accessibilityRole="button"
                  accessibilityLabel={`Email ${lead.customerName}`}
                >
                  <Ionicons name="mail-outline" size={18} color={PURPLE} />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  title: { fontSize: 22, fontWeight: "700", color: "#1a1a1a" },
  countBadge: {
    backgroundColor: PURPLE,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  countText: { color: "#fff", fontSize: 13, fontWeight: "700" },

  content: { paddingHorizontal: 20, paddingBottom: 32 },

  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  avatarWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: PURPLE,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    overflow: "hidden",
  },
  avatar: { width: 48, height: 48 },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: "700", color: "#1a1a1a" },
  email: { fontSize: 12, color: "#888", marginTop: 2 },
  propertyRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  propertyTitle: { fontSize: 12, color: "#888", flex: 1 },
  actions: { flexDirection: "row", gap: 8 },
  actionBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
  },

  emptyState: { alignItems: "center", marginTop: 80, gap: 10 },
  emptyTitle: { fontSize: 17, fontWeight: "700", color: "#333" },
  emptySubtitle: { fontSize: 14, color: "#aaa", textAlign: "center", paddingHorizontal: 20 },
});
