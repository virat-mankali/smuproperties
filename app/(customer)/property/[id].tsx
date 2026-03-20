import { useQuery } from "convex/react";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";


const PURPLE = "#7c3aed";
const { width: SCREEN_W } = Dimensions.get("window");

const PLACEHOLDER_IMAGES = [
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
  "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80",
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80",
];

export default function PropertyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState(0);
  const [saved, setSaved] = useState(false);

  const property = useQuery("properties:getById" as any, {
    id: id as string,
  });

  if (property === undefined) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={PURPLE} />
      </SafeAreaView>
    );
  }

  if (property === null) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.errorText}>Property not found</Text>
      </SafeAreaView>
    );
  }

  const images =
    property.imageUrls.length > 0 ? property.imageUrls : PLACEHOLDER_IMAGES;

  const statusLabel =
    property.status === "for_rent"
      ? "For Rent"
      : property.status === "for_sale"
      ? "For Sale"
      : property.status === "sold"
      ? "Sold"
      : property.status;

  const typeLabel =
    property.propertyType.charAt(0).toUpperCase() +
    property.propertyType.slice(1);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Top Nav */}
        <View style={styles.topNav}>
          <TouchableOpacity
            style={styles.navBtn}
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={20} color="#333" />
          </TouchableOpacity>
          <Text style={styles.navTitle}>Details</Text>
          <View style={styles.navRight}>
            <TouchableOpacity
              style={styles.navBtn}
              accessibilityRole="button"
              accessibilityLabel="Share property"
            >
              <Ionicons name="share-outline" size={20} color="#333" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.navBtn}
              onPress={() => setSaved((s) => !s)}
              accessibilityRole="button"
              accessibilityLabel={saved ? "Remove from saved" : "Save property"}
            >
              <Ionicons
                name={saved ? "heart" : "heart-outline"}
                size={20}
                color={saved ? "#ef4444" : "#333"}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Main Image */}
        <View style={styles.mainImageWrap}>
          <Image
            source={{ uri: images[selectedImage] }}
            style={styles.mainImage}
            resizeMode="cover"
          />
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{typeLabel}</Text>
          </View>
        </View>

        {/* Thumbnail Strip */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.thumbStrip}
        >
          {images.map((uri: string, idx: number) => (
            <TouchableOpacity
              key={idx}
              onPress={() => setSelectedImage(idx)}
              accessibilityRole="button"
              accessibilityLabel={`View image ${idx + 1}`}
            >
              <Image
                source={{ uri }}
                style={[
                  styles.thumb,
                  selectedImage === idx && styles.thumbActive,
                ]}
                resizeMode="cover"
              />
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Title & Price */}
        <View style={styles.titleRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.propertyTitle}>{property.title}</Text>
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={14} color="#888" />
              <Text style={styles.locationText}>{property.address}</Text>
            </View>
          </View>
          <View style={styles.priceBlock}>
            <Text style={styles.priceValue}>
              ₹
              {property.price >= 100000
                ? `${(property.price / 1000).toFixed(0)}k`
                : property.price.toLocaleString()}
            </Text>
            <Text style={styles.priceUnit}>/month</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Property Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Property Details</Text>
          <View style={styles.detailsGrid}>
            <DetailCell icon="bed-outline" label="Bedrooms" value="4" />
            <DetailCell icon="water-outline" label="Bathrooms" value="3" />
            <DetailCell
              icon="resize-outline"
              label="Size"
              value={`${property.area.toLocaleString()} sqft`}
            />
            <DetailCell icon="construct-outline" label="Build" value="2025" />
            <DetailCell icon="car-outline" label="Parking" value="2 Indoor" />
            <DetailCell icon="information-circle-outline" label="Status" value={statusLabel} />
          </View>
        </View>

        <View style={styles.divider} />

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{property.description}</Text>
        </View>

        <View style={styles.divider} />

        {/* Agent */}
        <View style={styles.agentRow}>
          <View style={styles.agentAvatar}>
            {property.agentAvatarUrl ? (
              <Image
                source={{ uri: property.agentAvatarUrl }}
                style={styles.agentAvatarImg}
              />
            ) : (
              <Ionicons name="person" size={24} color="#fff" />
            )}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.agentName}>{property.agentName}</Text>
            <Text style={styles.agentRole}>Property Owner Agent</Text>
          </View>
          <TouchableOpacity
            style={styles.chatBtn}
            accessibilityRole="button"
            accessibilityLabel={`Message ${property.agentName}`}
          >
            <Ionicons name="chatbubble-ellipses" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom CTA */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.bottomPrice}>
            ₹
            {property.price >= 100000
              ? `${(property.price / 1000).toFixed(0)}k`
              : property.price.toLocaleString()}
          </Text>
          <Text style={styles.bottomPriceLabel}>Total Price</Text>
        </View>
        <TouchableOpacity
          style={styles.bookBtn}
          accessibilityRole="button"
          accessibilityLabel="Book a visit"
        >
          <Text style={styles.bookBtnText}>Book a Visit</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function DetailCell({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.detailCell}>
      <Text style={styles.detailLabel}>{label}</Text>
      <View style={styles.detailValueRow}>
        <Ionicons name={icon as any} size={16} color="#555" />
        <Text style={styles.detailValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { fontSize: 16, color: "#888" },

  topNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  navBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
  },
  navTitle: { fontSize: 17, fontWeight: "600", color: "#1a1a1a" },
  navRight: { flexDirection: "row", gap: 8 },

  mainImageWrap: { marginHorizontal: 16, borderRadius: 20, overflow: "hidden" },
  mainImage: { width: "100%", height: 240 },
  badge: {
    position: "absolute",
    top: 14,
    left: 14,
    backgroundColor: "rgba(124,58,237,0.85)",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  badgeText: { color: "#fff", fontSize: 12, fontWeight: "600" },

  thumbStrip: { paddingHorizontal: 16, paddingVertical: 12, gap: 10 },
  thumb: { width: 80, height: 60, borderRadius: 12 },
  thumbActive: { borderWidth: 2.5, borderColor: PURPLE },

  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  propertyTitle: { fontSize: 20, fontWeight: "700", color: "#1a1a1a", marginBottom: 4 },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 3 },
  locationText: { fontSize: 13, color: "#888" },
  priceBlock: { alignItems: "flex-end" },
  priceValue: { fontSize: 22, fontWeight: "700", color: PURPLE },
  priceUnit: { fontSize: 12, color: "#888" },

  divider: { height: 1, backgroundColor: "#f0f0f0", marginHorizontal: 20, marginVertical: 16 },

  section: { paddingHorizontal: 20 },
  sectionTitle: { fontSize: 17, fontWeight: "700", color: "#1a1a1a", marginBottom: 14 },

  detailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 0,
  },
  detailCell: {
    width: "33.33%",
    paddingVertical: 10,
    paddingHorizontal: 4,
    alignItems: "center",
  },
  detailLabel: { fontSize: 11, color: "#aaa", marginBottom: 6 },
  detailValueRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  detailValue: { fontSize: 14, fontWeight: "600", color: "#1a1a1a" },

  description: { fontSize: 14, color: "#555", lineHeight: 22 },

  agentRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    gap: 12,
  },
  agentAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: PURPLE,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  agentAvatarImg: { width: 52, height: 52 },
  agentName: { fontSize: 15, fontWeight: "700", color: "#1a1a1a" },
  agentRole: { fontSize: 12, color: "#888", marginTop: 2 },
  chatBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: PURPLE,
    justifyContent: "center",
    alignItems: "center",
  },

  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 16,
    paddingBottom: 28,
  },
  bottomPrice: { fontSize: 20, fontWeight: "700", color: "#1a1a1a" },
  bottomPriceLabel: { fontSize: 12, color: "#888" },
  bookBtn: {
    backgroundColor: PURPLE,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 14,
  },
  bookBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});
