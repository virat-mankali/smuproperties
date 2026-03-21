import { useQuery, useMutation } from "convex/react";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

const PURPLE = "#7c3aed";
const BG = "#f5f0ff";

const PLACEHOLDER = "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80";

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

type StatusFilter = "all" | "for_sale" | "for_rent" | "sold" | "hidden";
const FILTERS: { label: string; value: StatusFilter }[] = [
  { label: "All", value: "all" },
  { label: "For Sale", value: "for_sale" },
  { label: "For Rent", value: "for_rent" },
  { label: "Sold", value: "sold" },
  { label: "Hidden", value: "hidden" },
];

export default function ListingsScreen() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<StatusFilter>("all");
  const listings = useQuery("properties:listByAgent" as any);
  const deleteProperty = useMutation("properties:deleteProperty" as any);

  const filtered = (listings as any[])?.filter((p: any) =>
    activeFilter === "all" ? true : p.status === activeFilter
  );

  const handleDelete = (id: string, title: string) => {
    Alert.alert("Delete Listing", `Remove "${title}"? This cannot be undone.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteProperty({ id }),
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>My Listings</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => router.push("/(agent)/add-listing")}
          accessibilityRole="button"
          accessibilityLabel="Add new listing"
        >
          <Ionicons name="add" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Status Filters — sticky below header */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterContent}
        style={styles.filterScroll}
      >
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.value}
            style={[styles.chip, activeFilter === f.value && styles.chipActive]}
            onPress={() => setActiveFilter(f.value)}
            accessibilityRole="button"
            accessibilityLabel={`Filter by ${f.label}`}
          >
            <Text style={[styles.chipText, activeFilter === f.value && styles.chipTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* List */}
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {listings === undefined ? (
          <ActivityIndicator color={PURPLE} style={{ marginTop: 60 }} />
        ) : filtered && filtered.length > 0 ? (
          filtered.map((item: any) => (
            <View key={item._id} style={styles.card}>
              <Image
                source={{ uri: item.imageUrl ?? PLACEHOLDER }}
                style={styles.cardImage}
                resizeMode="cover"
              />
              <View style={styles.cardBody}>
                <View style={styles.cardTopRow}>
                  <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
                  <View style={[styles.badge, { backgroundColor: (STATUS_COLORS[item.status] ?? "#888") + "20" }]}>
                    <Text style={[styles.badgeText, { color: STATUS_COLORS[item.status] ?? "#888" }]}>
                      {STATUS_LABELS[item.status] ?? item.status}
                    </Text>
                  </View>
                </View>
                <View style={styles.addressRow}>
                  <Ionicons name="location-outline" size={13} color="#888" />
                  <Text style={styles.address} numberOfLines={1}>{item.address}</Text>
                </View>
                <View style={styles.cardFooter}>
                  <Text style={styles.price}>
                    ₹{item.price >= 100000
                      ? `${(item.price / 100000).toFixed(1)}L`
                      : item.price.toLocaleString()}
                  </Text>
                  <View style={styles.viewsRow}>
                    <Ionicons name="eye-outline" size={14} color="#888" />
                    <Text style={styles.viewsText}>{item.views ?? 0} views</Text>
                  </View>
                </View>
                <View style={styles.actionsRow}>
                  <TouchableOpacity
                    style={styles.editBtn}
                    onPress={() => router.push({ pathname: "/(agent)/edit-listing", params: { id: item._id } })}
                    accessibilityRole="button"
                    accessibilityLabel={`Edit ${item.title}`}
                  >
                    <Ionicons name="pencil-outline" size={15} color={PURPLE} />
                    <Text style={styles.editBtnText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => handleDelete(item._id, item.title)}
                    accessibilityRole="button"
                    accessibilityLabel={`Delete ${item.title}`}
                  >
                    <Ionicons name="trash-outline" size={15} color="#ef4444" />
                    <Text style={styles.deleteBtnText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="home-outline" size={52} color="#ccc" />
            <Text style={styles.emptyTitle}>No listings found</Text>
            <Text style={styles.emptySubtitle}>
              {activeFilter === "all" ? "Add your first property listing" : `No ${STATUS_LABELS[activeFilter]} listings`}
            </Text>
            {activeFilter === "all" && (
              <TouchableOpacity
                style={styles.emptyAddBtn}
                onPress={() => router.push("/(agent)/add-listing")}
                accessibilityRole="button"
                accessibilityLabel="Add listing"
              >
                <Text style={styles.emptyAddBtnText}>Add Listing</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  title: { fontSize: 22, fontWeight: "700", color: "#1a1a1a" },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: PURPLE,
    justifyContent: "center",
    alignItems: "center",
  },

  filterScroll: { marginBottom: 12 },
  filterContent: { paddingHorizontal: 20, gap: 10 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  chipActive: { backgroundColor: PURPLE, borderColor: PURPLE },
  chipText: { fontSize: 13, fontWeight: "500", color: "#555" },
  chipTextActive: { color: "#fff" },

  content: { paddingHorizontal: 20, paddingBottom: 32 },

  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardImage: { width: "100%", height: 160 },
  cardBody: { padding: 14 },
  cardTopRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 4 },
  cardTitle: { flex: 1, fontSize: 15, fontWeight: "700", color: "#1a1a1a", marginRight: 8 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  badgeText: { fontSize: 11, fontWeight: "600" },
  addressRow: { flexDirection: "row", alignItems: "center", gap: 3, marginBottom: 8 },
  address: { fontSize: 12, color: "#888", flex: 1 },
  cardFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  price: { fontSize: 17, fontWeight: "700", color: "#1a1a1a" },
  viewsRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  viewsText: { fontSize: 12, color: "#888" },
  actionsRow: { flexDirection: "row", gap: 10 },
  editBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: PURPLE,
  },
  editBtnText: { fontSize: 13, fontWeight: "600", color: PURPLE },
  deleteBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#ef4444",
  },
  deleteBtnText: { fontSize: 13, fontWeight: "600", color: "#ef4444" },

  emptyState: { alignItems: "center", marginTop: 60, gap: 10 },
  emptyTitle: { fontSize: 17, fontWeight: "700", color: "#333" },
  emptySubtitle: { fontSize: 14, color: "#aaa", textAlign: "center" },
  emptyAddBtn: {
    marginTop: 12,
    backgroundColor: PURPLE,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyAddBtnText: { color: "#fff", fontWeight: "600", fontSize: 14 },
});
