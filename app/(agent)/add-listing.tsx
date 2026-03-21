import { useMutation } from "convex/react";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

const PURPLE = "#7c3aed";
const BG = "#f5f0ff";

type PropertyType = "villa" | "apartment" | "land" | "commercial";
type StatusType = "for_sale" | "for_rent" | "hidden";

const PROPERTY_TYPES: { label: string; value: PropertyType; icon: string }[] = [
  { label: "House", value: "villa", icon: "home-outline" },
  { label: "Apartment", value: "apartment", icon: "business-outline" },
  { label: "Land", value: "land", icon: "map-outline" },
  { label: "Commercial", value: "commercial", icon: "storefront-outline" },
];

const STATUS_OPTIONS: { label: string; value: StatusType; color: string }[] = [
  { label: "For Sale", value: "for_sale", color: "#10b981" },
  { label: "For Rent", value: "for_rent", color: "#0ea5e9" },
  { label: "Hidden", value: "hidden", color: "#f59e0b" },
];

export default function AddListingScreen() {
  const router = useRouter();
  const createProperty = useMutation("properties:createProperty" as any);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [area, setArea] = useState("");
  const [address, setAddress] = useState("");
  const [propertyType, setPropertyType] = useState<PropertyType>("villa");
  const [status, setStatus] = useState<StatusType>("for_sale");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim() || !price || !area || !address.trim()) {
      Alert.alert("Missing Fields", "Please fill in all required fields.");
      return;
    }
    const priceNum = parseFloat(price);
    const areaNum = parseFloat(area);
    if (isNaN(priceNum) || isNaN(areaNum)) {
      Alert.alert("Invalid Input", "Price and area must be valid numbers.");
      return;
    }

    setLoading(true);
    try {
      await createProperty({
        title: title.trim(),
        description: description.trim(),
        price: priceNum,
        area: areaNum,
        propertyType,
        status,
        address: address.trim(),
        latitude: 0,
        longitude: 0,
        imageIds: [],
      });
      Alert.alert("Success", "Listing created successfully!", [
        { text: "OK", onPress: () => router.push("/(agent)/listings") },
      ]);
    } catch (e: any) {
      Alert.alert("Error", e.message ?? "Failed to create listing.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={22} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add Listing</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Property Type */}
          <Text style={styles.label}>Property Type</Text>
          <View style={styles.typeRow}>
            {PROPERTY_TYPES.map((t) => (
              <TouchableOpacity
                key={t.value}
                style={[styles.typeBtn, propertyType === t.value && styles.typeBtnActive]}
                onPress={() => setPropertyType(t.value)}
                accessibilityRole="button"
                accessibilityLabel={`Select ${t.label}`}
              >
                <Ionicons
                  name={t.icon as any}
                  size={20}
                  color={propertyType === t.value ? "#fff" : PURPLE}
                />
                <Text style={[styles.typeBtnText, propertyType === t.value && styles.typeBtnTextActive]}>
                  {t.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Title */}
          <Text style={styles.label}>Title *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Modern 3BHK Villa in Bandra"
            placeholderTextColor="#b0a4c8"
            value={title}
            onChangeText={setTitle}
            accessibilityLabel="Property title"
          />

          {/* Address */}
          <Text style={styles.label}>Address *</Text>
          <TextInput
            style={styles.input}
            placeholder="Full address"
            placeholderTextColor="#b0a4c8"
            value={address}
            onChangeText={setAddress}
            accessibilityLabel="Property address"
          />

          {/* Price & Area */}
          <View style={styles.rowInputs}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Price (₹) *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 5000000"
                placeholderTextColor="#b0a4c8"
                value={price}
                onChangeText={setPrice}
                keyboardType="numeric"
                accessibilityLabel="Property price"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Area (sq ft) *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 1200"
                placeholderTextColor="#b0a4c8"
                value={area}
                onChangeText={setArea}
                keyboardType="numeric"
                accessibilityLabel="Property area"
              />
            </View>
          </View>

          {/* Description */}
          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe the property..."
            placeholderTextColor="#b0a4c8"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            accessibilityLabel="Property description"
          />

          {/* Status */}
          <Text style={styles.label}>Listing Status</Text>
          <View style={styles.statusRow}>
            {STATUS_OPTIONS.map((s) => (
              <TouchableOpacity
                key={s.value}
                style={[
                  styles.statusBtn,
                  status === s.value && { backgroundColor: s.color + "20", borderColor: s.color },
                ]}
                onPress={() => setStatus(s.value)}
                accessibilityRole="button"
                accessibilityLabel={`Set status to ${s.label}`}
              >
                <Text style={[styles.statusBtnText, status === s.value && { color: s.color }]}>
                  {s.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Submit */}
          <TouchableOpacity
            style={[styles.submitBtn, loading && { opacity: 0.7 }]}
            onPress={handleSubmit}
            disabled={loading}
            accessibilityRole="button"
            accessibilityLabel="Create listing"
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                <Text style={styles.submitBtnText}>Create Listing</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#1a1a1a" },

  content: { paddingHorizontal: 20, paddingBottom: 40 },

  label: { fontSize: 13, fontWeight: "600", color: "#444", marginBottom: 8, marginTop: 16 },

  typeRow: { flexDirection: "row", gap: 10 },
  typeBtn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
    gap: 4,
  },
  typeBtnActive: { backgroundColor: PURPLE, borderColor: PURPLE },
  typeBtnText: { fontSize: 11, fontWeight: "600", color: PURPLE },
  typeBtnTextActive: { color: "#fff" },

  input: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: "#1a1a1a",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  textArea: { height: 100, paddingTop: 12 },

  rowInputs: { flexDirection: "row", gap: 12 },

  statusRow: { flexDirection: "row", gap: 10 },
  statusBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  statusBtnText: { fontSize: 13, fontWeight: "600", color: "#555" },

  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 28,
    backgroundColor: PURPLE,
    paddingVertical: 16,
    borderRadius: 14,
  },
  submitBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
