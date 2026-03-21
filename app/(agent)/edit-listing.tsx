import { useQuery, useMutation } from "convex/react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
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

type StatusType = "for_sale" | "for_rent" | "sold" | "hidden";

const STATUS_OPTIONS: { label: string; value: StatusType; color: string }[] = [
  { label: "For Sale", value: "for_sale", color: "#10b981" },
  { label: "For Rent", value: "for_rent", color: "#0ea5e9" },
  { label: "Sold", value: "sold", color: "#6b7280" },
  { label: "Hidden", value: "hidden", color: "#f59e0b" },
];

export default function EditListingScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const property = useQuery("properties:getById" as any, id ? { id } : "skip");
  const updateProperty = useMutation("properties:updateProperty" as any);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [area, setArea] = useState("");
  const [address, setAddress] = useState("");
  const [status, setStatus] = useState<StatusType>("for_sale");
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (property && !initialized) {
      setTitle(property.title ?? "");
      setDescription(property.description ?? "");
      setPrice(String(property.price ?? ""));
      setArea(String(property.area ?? ""));
      setAddress(property.address ?? "");
      setStatus((property.status as StatusType) ?? "for_sale");
      setInitialized(true);
    }
  }, [property, initialized]);

  const handleSave = async () => {
    if (!title.trim() || !price || !area || !address.trim()) {
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
      await updateProperty({
        id,
        title: title.trim(),
        description: description.trim(),
        price: priceNum,
        area: areaNum,
        address: address.trim(),
        status,
      });
      Alert.alert("Saved", "Listing updated successfully.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (e: any) {
      Alert.alert("Error", e.message ?? "Failed to update listing.");
    } finally {
      setLoading(false);
    }
  };

  if (property === undefined) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <ActivityIndicator color={PURPLE} style={{ marginTop: 80 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={22} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Listing</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.label}>Title *</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholderTextColor="#b0a4c8"
            accessibilityLabel="Property title"
          />

          <Text style={styles.label}>Address *</Text>
          <TextInput
            style={styles.input}
            value={address}
            onChangeText={setAddress}
            placeholderTextColor="#b0a4c8"
            accessibilityLabel="Property address"
          />

          <View style={styles.rowInputs}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Price (₹) *</Text>
              <TextInput
                style={styles.input}
                value={price}
                onChangeText={setPrice}
                keyboardType="numeric"
                placeholderTextColor="#b0a4c8"
                accessibilityLabel="Property price"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Area (sq ft) *</Text>
              <TextInput
                style={styles.input}
                value={area}
                onChangeText={setArea}
                keyboardType="numeric"
                placeholderTextColor="#b0a4c8"
                accessibilityLabel="Property area"
              />
            </View>
          </View>

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            placeholderTextColor="#b0a4c8"
            accessibilityLabel="Property description"
          />

          <Text style={styles.label}>Status</Text>
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

          <TouchableOpacity
            style={[styles.saveBtn, loading && { opacity: 0.7 }]}
            onPress={handleSave}
            disabled={loading}
            accessibilityRole="button"
            accessibilityLabel="Save changes"
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                <Text style={styles.saveBtnText}>Save Changes</Text>
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
  statusRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  statusBtn: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
    backgroundColor: "#fff",
  },
  statusBtnText: { fontSize: 13, fontWeight: "600", color: "#555" },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 28,
    backgroundColor: PURPLE,
    paddingVertical: 16,
    borderRadius: 14,
  },
  saveBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
