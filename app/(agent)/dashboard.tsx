import { useQuery } from "convex/react";
import { useRouter } from "expo-router";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

const PURPLE = "#7c3aed";
const BG = "#f5f0ff";

export default function AgentDashboard() {
  const router = useRouter();
  const stats = useQuery("properties:getAgentStats" as any);
  const listings = useQuery("properties:listByAgent" as any);

  const recentListings = (listings as any[])?.slice(0, 3);

  const STAT_CARDS = [
    { label: "Listings", value: stats?.totalListings ?? 0, icon: "home-outline", color: "#7c3aed" },
    { label: "Total Views", value: stats?.totalViews ?? 0, icon: "eye-outline", color: "#0ea5e9" },
    { label: "Leads", value: stats?.totalLeads ?? 0, icon: "people-outline", color: "#10b981" },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Agent Dashboard</Text>
            <Text style={styles.subGreeting}>Manage your listings & leads</Text>
          </View>
          <TouchableOpacity
            style={styles.bellBtn}
            accessibilityRole="button"
            accessibilityLabel="Notifications"
          >
            <Ionicons name="notifications-outline" size={22} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Stats Row */}
        {stats === undefined ? (
          <ActivityIndicator color={PURPLE} style={{ marginVertical: 24 }} />
        ) : (
          <View style={styles.statsRow}>
            {STAT_CARDS.map((s) => (
              <View key={s.label} style={styles.statCard}>
                <View style={[styles.statIconWrap, { backgroundColor: s.color + "20" }]}>
                  <Ionicons name={s.icon as any} size={22} color={s.color} />
                </View>
                <Text style={styles.statValue}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
        </View>
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => router.push("/(agent)/add-listing")}
            accessibilityRole="button"
            accessibilityLabel="Add new listing"
          >
            <Ionicons name="add-circle-outline" size={24} color={PURPLE} />
            <Text style={styles.actionText}>Add Listing</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => router.push("/(agent)/leads")}
            accessibilityRole="button"
            accessibilityLabel="View leads"
          >
            <Ionicons name="people-outline" size={24} color="#10b981" />
            <Text style={styles.actionText}>View Leads</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => router.push("/(agent)/listings")}
            accessibilityRole="button"
            accessibilityLabel="Manage listings"
          >
            <Ionicons name="list-outline" size={24} color="#0ea5e9" />
            <Text style={styles.actionText}>Manage</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Listings */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Listings</Text>
          <TouchableOpacity
            onPress={() => router.push("/(agent)/listings")}
            accessibilityRole="button"
            accessibilityLabel="See all listings"
          >
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>

        {listings === undefined ? (
          <ActivityIndicator color={PURPLE} style={{ marginTop: 20 }} />
        ) : recentListings && recentListings.length > 0 ? (
          recentListings.map((item: any) => (
            <RecentListingCard key={item._id} item={item} />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="home-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>No listings yet</Text>
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => router.push("/(agent)/add-listing")}
              accessibilityRole="button"
              accessibilityLabel="Add your first listing"
            >
              <Text style={styles.addBtnText}>Add Your First Listing</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function RecentListingCard({ item }: { item: any }) {
  const STATUS_COLORS: Record<string, string> = {
    for_sale: "#10b981",
    for_rent: "#0ea5e9",
    sold: "#6b7280",
    hidden: "#f59e0b",
  };
  const STATUS_LABELS: Record<string, string> = {
    for_sale: "For Sale",
    for_rent: "For Rent",
    sold: "Sold",
    hidden: "Hidden",
  };

  return (
    <View style={styles.listingCard}>
      <View style={styles.listingIconWrap}>
        <Ionicons name="home" size={20} color={PURPLE} />
      </View>
      <View style={styles.listingInfo}>
        <Text style={styles.listingTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.listingAddress} numberOfLines={1}>{item.address}</Text>
        <Text style={styles.listingPrice}>
          ₹{item.price >= 100000
            ? `${(item.price / 100000).toFixed(1)}L`
            : item.price.toLocaleString()}
        </Text>
      </View>
      <View style={styles.listingMeta}>
        <View style={[styles.statusBadge, { backgroundColor: (STATUS_COLORS[item.status] ?? "#888") + "20" }]}>
          <Text style={[styles.statusText, { color: STATUS_COLORS[item.status] ?? "#888" }]}>
            {STATUS_LABELS[item.status] ?? item.status}
          </Text>
        </View>
        <View style={styles.viewsRow}>
          <Ionicons name="eye-outline" size={13} color="#888" />
          <Text style={styles.viewsText}>{item.views ?? 0}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  content: { paddingBottom: 32 },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  greeting: { fontSize: 22, fontWeight: "700", color: "#1a1a1a" },
  subGreeting: { fontSize: 13, color: "#888", marginTop: 2 },
  bellBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },

  statsRow: { flexDirection: "row", paddingHorizontal: 20, gap: 12, marginBottom: 24 },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statValue: { fontSize: 22, fontWeight: "700", color: "#1a1a1a" },
  statLabel: { fontSize: 11, color: "#888", marginTop: 2, textAlign: "center" },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 17, fontWeight: "700", color: "#1a1a1a" },
  seeAll: { fontSize: 13, color: PURPLE, fontWeight: "500" },

  actionsRow: { flexDirection: "row", paddingHorizontal: 20, gap: 12, marginBottom: 24 },
  actionBtn: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    gap: 6,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  actionText: { fontSize: 12, fontWeight: "600", color: "#333" },

  listingCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 16,
    padding: 14,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  listingIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#f0e8ff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  listingInfo: { flex: 1 },
  listingTitle: { fontSize: 14, fontWeight: "700", color: "#1a1a1a" },
  listingAddress: { fontSize: 12, color: "#888", marginTop: 2 },
  listingPrice: { fontSize: 14, fontWeight: "700", color: PURPLE, marginTop: 4 },
  listingMeta: { alignItems: "flex-end", gap: 6 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: "600" },
  viewsRow: { flexDirection: "row", alignItems: "center", gap: 3 },
  viewsText: { fontSize: 12, color: "#888" },

  emptyState: { alignItems: "center", marginTop: 40, gap: 12 },
  emptyText: { fontSize: 15, color: "#aaa" },
  addBtn: {
    marginTop: 8,
    backgroundColor: PURPLE,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  addBtnText: { color: "#fff", fontWeight: "600", fontSize: 14 },
});
