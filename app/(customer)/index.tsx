import { useQuery } from "convex/react";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";


const PURPLE = "#7c3aed";
const BG = "#f5f0ff";

type FilterType = "all" | "villa" | "apartment" | "land" | "commercial";

const FILTERS: { label: string; value: FilterType }[] = [
  { label: "All", value: "all" },
  { label: "House", value: "villa" },
  { label: "Apartment", value: "apartment" },
];

const PLACEHOLDER_IMAGES = [
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80",
  "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=600&q=80",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80",
];

export default function HomeScreen() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [search, setSearch] = useState("");

  const properties = useQuery("properties:listPublic" as any, {
    propertyType: activeFilter,
  });

  const filtered = (properties as any[])?.filter((p: any) =>
    search.trim()
      ? p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.address.toLowerCase().includes(search.toLowerCase())
      : true
  );

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.locationRow}>
            <Ionicons name="location" size={18} color={PURPLE} />
            <Text style={styles.locationText}>Properties</Text>
            <Ionicons name="chevron-down" size={16} color="#333" />
          </View>
          <TouchableOpacity style={styles.bellBtn} accessibilityRole="button" accessibilityLabel="Notifications">
            <Ionicons name="notifications-outline" size={22} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Ionicons name="search-outline" size={18} color="#aaa" style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search your home..."
              placeholderTextColor="#b0a4c8"
              value={search}
              onChangeText={setSearch}
              accessibilityLabel="Search properties"
            />
          </View>
          <TouchableOpacity style={styles.filterBtn} accessibilityRole="button" accessibilityLabel="Filter">
            <Ionicons name="options" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Category Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterContent}
        >
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f.value}
              style={[styles.filterChip, activeFilter === f.value && styles.filterChipActive]}
              onPress={() => setActiveFilter(f.value)}
              accessibilityRole="button"
              accessibilityLabel={`Filter by ${f.label}`}
            >
              <Text style={[styles.filterChipText, activeFilter === f.value && styles.filterChipTextActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Best Offer Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Best Offer</Text>
          <TouchableOpacity accessibilityRole="button" accessibilityLabel="See all properties">
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>

        {/* Property Cards */}
        {properties === undefined ? (
          <ActivityIndicator color={PURPLE} style={{ marginTop: 40 }} />
        ) : filtered && filtered.length > 0 ? (
          filtered.map((item: any, idx: number) => (
            <TouchableOpacity
              key={item._id}
              style={styles.card}
              onPress={() => router.push(`/(customer)/property/${item._id}`)}
              accessibilityRole="button"
              accessibilityLabel={`View details for ${item.title}`}
            >
              <Image
                source={{ uri: item.imageUrl ?? PLACEHOLDER_IMAGES[idx % PLACEHOLDER_IMAGES.length] }}
                style={styles.cardImage}
                resizeMode="cover"
              />
              <View style={styles.cardBody}>
                <View style={styles.cardTitleRow}>
                  <View style={styles.cardIconWrap}>
                    <Ionicons name="home" size={16} color={PURPLE} />
                  </View>
                  <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
                  <TouchableOpacity
                    style={styles.arrowBtn}
                    onPress={() => router.push(`/(customer)/property/${item._id}`)}
                    accessibilityRole="button"
                    accessibilityLabel={`Open ${item.title}`}
                  >
                    <Ionicons name="arrow-forward" size={18} color="#fff" />
                  </TouchableOpacity>
                </View>
                <View style={styles.locationTagRow}>
                  <Ionicons name="location-outline" size={13} color="#888" />
                  <Text style={styles.locationTag} numberOfLines={1}>{item.address}</Text>
                </View>
                <View style={styles.priceRow}>
                  <Text style={styles.price}>
                    ₹{item.price >= 100000
                      ? `${(item.price / 100000).toFixed(1)}L`
                      : item.price.toLocaleString()}
                  </Text>
                  <View style={styles.ratingRow}>
                    <Ionicons name="star" size={13} color="#f59e0b" />
                    <Text style={styles.rating}>4.8</Text>
                  </View>
                </View>
                <View style={styles.statsRow}>
                  <View style={styles.stat}>
                    <Ionicons name="car-outline" size={14} color="#666" />
                    <Text style={styles.statText}>2 Car</Text>
                  </View>
                  <View style={styles.stat}>
                    <Ionicons name="water-outline" size={14} color="#666" />
                    <Text style={styles.statText}>2 Bath</Text>
                  </View>
                  <View style={styles.stat}>
                    <Ionicons name="bed-outline" size={14} color="#666" />
                    <Text style={styles.statText}>3 Bed</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="home-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>No properties found</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  scroll: { flex: 1 },
  content: { paddingBottom: 24 },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  locationText: { fontSize: 16, fontWeight: "600", color: "#1a1a1a", marginHorizontal: 4 },
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

  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 16,
  },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 28,
    paddingHorizontal: 14,
    paddingVertical: 0,
    height: 44,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#1a1a1a",
    height: 44,
    paddingVertical: 0,
  },
  filterBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: PURPLE,
    justifyContent: "center",
    alignItems: "center",
  },

  filterScroll: { marginBottom: 20 },
  filterContent: { paddingHorizontal: 20, gap: 10 },
  filterChip: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  filterChipActive: { backgroundColor: PURPLE, borderColor: PURPLE },
  filterChipText: { fontSize: 13, fontWeight: "500", color: "#555" },
  filterChipTextActive: { color: "#fff" },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: "#1a1a1a" },
  seeAll: { fontSize: 14, color: PURPLE, fontWeight: "500" },

  card: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: "#fff",
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
  },
  cardImage: { width: "100%", height: 200 },
  cardBody: { padding: 14 },
  cardTitleRow: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  cardIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f0e8ff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  cardTitle: { flex: 1, fontSize: 16, fontWeight: "700", color: "#1a1a1a" },
  arrowBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: PURPLE,
    justifyContent: "center",
    alignItems: "center",
  },
  locationTagRow: { flexDirection: "row", alignItems: "center", gap: 3, marginBottom: 8 },
  locationTag: { fontSize: 12, color: "#888", flex: 1 },
  priceRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  price: { fontSize: 20, fontWeight: "700", color: "#1a1a1a" },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 3 },
  rating: { fontSize: 13, fontWeight: "600", color: "#1a1a1a" },
  statsRow: { flexDirection: "row", gap: 16 },
  stat: { flexDirection: "row", alignItems: "center", gap: 4 },
  statText: { fontSize: 12, color: "#666" },

  emptyState: { alignItems: "center", marginTop: 60, gap: 12 },
  emptyText: { fontSize: 16, color: "#aaa" },
});
