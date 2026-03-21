import { useClerk } from "@clerk/clerk-expo";
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Switch,
  Linking,
  Alert,
  Modal,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

const PURPLE = "#7c3aed";
const BG = "#f5f0ff";

// Placeholder social links — replace with real URLs when ready
const SOCIAL_LINKS = {
  instagram: "",
  facebook: "",
  youtube: "",
  threads: "",
};

const SOCIALS: { key: keyof typeof SOCIAL_LINKS; label: string; icon: string; color: string }[] = [
  { key: "instagram", label: "Instagram", icon: "logo-instagram", color: "#e1306c" },
  { key: "facebook", label: "Facebook", icon: "logo-facebook", color: "#1877f2" },
  { key: "youtube", label: "YouTube", icon: "logo-youtube", color: "#ff0000" },
  { key: "threads", label: "Threads", icon: "chatbubble-ellipses-outline", color: "#000" },
];

export default function AgentProfileScreen() {
  const { signOut } = useClerk();
  const user = useQuery("users:getMe" as any);
  const stats = useQuery("properties:getAgentStats" as any);
  const updatePhone = useMutation("users:updatePhone" as any);

  const [notifNewLead, setNotifNewLead] = useState(true);
  const [notifMessages, setNotifMessages] = useState(true);
  const [notifListingViews, setNotifListingViews] = useState(false);
  const [notifUpdates, setNotifUpdates] = useState(true);
  const [phoneModal, setPhoneModal] = useState(false);
  const [phoneInput, setPhoneInput] = useState("");
  const [savingPhone, setSavingPhone] = useState(false);

  const STAT_ITEMS = [
    { label: "Listings", value: stats?.totalListings ?? 0 },
    { label: "Views", value: stats?.totalViews ?? 0 },
    { label: "Leads", value: stats?.totalLeads ?? 0 },
  ];

  const NOTIF_ROWS = [
    { label: "New Lead", sub: "When a customer saves your property", value: notifNewLead, onChange: setNotifNewLead },
    { label: "Messages", sub: "When you receive a new message", value: notifMessages, onChange: setNotifMessages },
    { label: "Listing Views", sub: "Daily view count summary", value: notifListingViews, onChange: setNotifListingViews },
    { label: "App Updates", sub: "New features and announcements", value: notifUpdates, onChange: setNotifUpdates },
  ];

  const handleSocialPress = (key: keyof typeof SOCIAL_LINKS) => {
    const url = SOCIAL_LINKS[key];
    if (!url) {
      Alert.alert("Coming Soon", "This link hasn't been added yet.");
      return;
    }
    Linking.openURL(url);
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Avatar + Name */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarWrap}>
            {user?.avatarUrl ? (
              <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
            ) : (
              <Ionicons name="person" size={44} color="#fff" />
            )}
          </View>
          <Text style={styles.name}>{user?.name ?? "Agent"}</Text>
          <Text style={styles.emailText}>{user?.email ?? ""}</Text>
          <View style={styles.roleBadge}>
            <Ionicons name="shield-checkmark-outline" size={13} color={PURPLE} />
            <Text style={styles.roleText}>Verified Agent</Text>
          </View>
        </View>

        {/* Stats Strip */}
        <View style={styles.statsStrip}>
          {STAT_ITEMS.map((s, i) => (
            <View
              key={s.label}
              style={[styles.statItem, i < STAT_ITEMS.length - 1 && styles.statDivider]}
            >
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Social Links */}
        <Text style={styles.sectionTitle}>Social Links</Text>
        <View style={styles.card}>
          {SOCIALS.map((s, i) => (
            <TouchableOpacity
              key={s.key}
              style={[styles.socialRow, i < SOCIALS.length - 1 && styles.rowDivider]}
              onPress={() => handleSocialPress(s.key)}
              accessibilityRole="link"
              accessibilityLabel={`Open ${s.label}`}
            >
              <View style={[styles.socialIconWrap, { backgroundColor: s.color + "18" }]}>
                <Ionicons name={s.icon as any} size={20} color={s.color} />
              </View>
              <View style={styles.socialInfo}>
                <Text style={styles.socialLabel}>{s.label}</Text>
                <Text style={styles.socialSub}>
                  {SOCIAL_LINKS[s.key] ? SOCIAL_LINKS[s.key] : "Not linked yet"}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#ccc" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Notifications */}
        <Text style={styles.sectionTitle}>Notifications</Text>
        <View style={styles.card}>
          {NOTIF_ROWS.map((row, i) => (
            <View
              key={row.label}
              style={[styles.notifRow, i < NOTIF_ROWS.length - 1 && styles.rowDivider]}
            >
              <View style={styles.notifInfo}>
                <Text style={styles.notifLabel}>{row.label}</Text>
                <Text style={styles.notifSub}>{row.sub}</Text>
              </View>
              <Switch
                value={row.value}
                onValueChange={row.onChange}
                trackColor={{ false: "#e5e7eb", true: PURPLE + "80" }}
                thumbColor={row.value ? PURPLE : "#f4f3f4"}
                accessibilityLabel={`Toggle ${row.label} notifications`}
              />
            </View>
          ))}
        </View>

        {/* Account Info */}
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.card}>
          <View style={[styles.infoRow, styles.rowDivider]}>
            <View style={styles.infoIconWrap}>
              <Ionicons name="mail-outline" size={17} color={PURPLE} />
            </View>
            <View style={styles.infoText}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{user?.email ?? ""}</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <View style={styles.infoIconWrap}>
              <Ionicons name="call-outline" size={17} color={PURPLE} />
            </View>
            <View style={styles.infoText}>
              <Text style={styles.infoLabel}>Phone</Text>
              <Text style={styles.infoValue}>{user?.phone ?? "Not set"}</Text>
            </View>
            <TouchableOpacity
              onPress={() => { setPhoneInput(user?.phone ?? ""); setPhoneModal(true); }}
              style={styles.editPill}
              accessibilityRole="button"
              accessibilityLabel="Edit phone number"
            >
              <Ionicons name="create-outline" size={14} color={PURPLE} />
              <Text style={styles.editPillText}>Edit</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Phone Edit Modal */}
        <Modal visible={phoneModal} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <Text style={styles.modalTitle}>Update Phone</Text>
              <TextInput
                style={styles.modalInput}
                value={phoneInput}
                onChangeText={setPhoneInput}
                placeholder="+91 98765 43210"
                placeholderTextColor="#b0a4c8"
                keyboardType="phone-pad"
                accessibilityLabel="Phone number input"
              />
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalCancel}
                  onPress={() => setPhoneModal(false)}
                  accessibilityRole="button"
                  accessibilityLabel="Cancel"
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalSave}
                  onPress={async () => {
                    try {
                      setSavingPhone(true);
                      await updatePhone({ phone: phoneInput.trim() });
                      setPhoneModal(false);
                    } catch (e) {
                      Alert.alert("Error", "Failed to update phone number.");
                    } finally {
                      setSavingPhone(false);
                    }
                  }}
                  disabled={savingPhone}
                  accessibilityRole="button"
                  accessibilityLabel="Save phone number"
                >
                  <Text style={styles.modalSaveText}>{savingPhone ? "Saving…" : "Save"}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Sign Out */}
        <TouchableOpacity
          style={styles.signOutBtn}
          onPress={() => signOut()}
          accessibilityRole="button"
          accessibilityLabel="Sign out"
        >
          <Ionicons name="log-out-outline" size={18} color="#fff" />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  content: { paddingBottom: 40 },

  avatarSection: { alignItems: "center", paddingTop: 28, paddingBottom: 20 },
  avatarWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: PURPLE,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    overflow: "hidden",
    shadowColor: PURPLE,
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  avatar: { width: 96, height: 96 },
  name: { fontSize: 22, fontWeight: "700", color: "#1a1a1a" },
  emailText: { fontSize: 14, color: "#888", marginTop: 4 },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 8,
    backgroundColor: "#f0e8ff",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  roleText: { fontSize: 12, fontWeight: "600", color: PURPLE },

  statsStrip: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statItem: { flex: 1, alignItems: "center", paddingVertical: 16 },
  statDivider: { borderRightWidth: 1, borderRightColor: "#f0f0f0" },
  statValue: { fontSize: 20, fontWeight: "700", color: "#1a1a1a" },
  statLabel: { fontSize: 12, color: "#888", marginTop: 2 },

  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#888",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    paddingHorizontal: 20,
    marginBottom: 10,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    overflow: "hidden",
  },

  socialRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  socialIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  socialInfo: { flex: 1 },
  socialLabel: { fontSize: 14, fontWeight: "600", color: "#1a1a1a" },
  socialSub: { fontSize: 12, color: "#aaa", marginTop: 2 },

  notifRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  notifInfo: { flex: 1 },
  notifLabel: { fontSize: 14, fontWeight: "600", color: "#1a1a1a" },
  notifSub: { fontSize: 12, color: "#aaa", marginTop: 2 },

  rowDivider: { borderBottomWidth: 1, borderBottomColor: "#f5f5f5" },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  infoIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f0e8ff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  infoText: { flex: 1 },
  infoLabel: { fontSize: 12, color: "#888" },
  infoValue: { fontSize: 14, fontWeight: "600", color: "#1a1a1a", marginTop: 2 },

  editPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#f0e8ff",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  editPillText: { fontSize: 12, fontWeight: "600", color: PURPLE },

  signOutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginHorizontal: 20,
    backgroundColor: "#ef4444",
    paddingVertical: 14,
    borderRadius: 14,
  },
  signOutText: { color: "#fff", fontWeight: "700", fontSize: 15 },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  modalBox: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    width: "100%",
  },
  modalTitle: { fontSize: 17, fontWeight: "700", color: "#1a1a1a", marginBottom: 16 },
  modalInput: {
    backgroundColor: BG,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#1a1a1a",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 16,
  },
  modalActions: { flexDirection: "row", gap: 10 },
  modalCancel: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
    alignItems: "center",
  },
  modalCancelText: { fontSize: 14, fontWeight: "600", color: "#555" },
  modalSave: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: PURPLE,
    alignItems: "center",
  },
  modalSaveText: { fontSize: 14, fontWeight: "700", color: "#fff" },
});
