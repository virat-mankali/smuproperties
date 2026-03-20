import { useSignIn, useClerk } from "@clerk/clerk-expo";
import { Link } from "expo-router";
import { useState } from "react";
import { useConvex } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { setAuthTarget } from "../../hooks/useAuthTarget";

export default function AgentSignInScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const { signOut } = useClerk();
  const convex = useConvex();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSignIn = async () => {
    if (!isLoaded) return;
    setError("");
    setLoading(true);

    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === "complete") {
        // Check role BEFORE activating session
        const role = await convex.query(api.users.getRoleByEmail, { email });

        if (role !== "agent") {
          // Activate then immediately sign out to destroy the session
          await setActive({ session: result.createdSessionId });
          await signOut();
          Alert.alert(
            "Access denied",
            "This login is for agents only. Please use the customer login.",
          );
          setLoading(false);
          return;
        }

        setAuthTarget("/(agent)/dashboard");
        await setActive({ session: result.createdSessionId });
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message ?? "Sign in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.inner}>
        <Text style={styles.title}>Agent Login</Text>
        <Text style={styles.subtitle}>Sign in to your agent account</Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          accessibilityLabel="Email address"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          accessibilityLabel="Password"
        />

        <TouchableOpacity
          style={styles.button}
          onPress={onSignIn}
          disabled={loading}
          accessibilityRole="button"
          accessibilityLabel="Sign in as agent"
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Sign In as Agent</Text>
          )}
        </TouchableOpacity>

        <Link href="/(auth)/sign-in" asChild>
          <TouchableOpacity style={styles.link} accessibilityRole="link">
            <Text style={styles.linkText}>
              Not an agent? <Text style={styles.linkBold}>Customer Login</Text>
            </Text>
          </TouchableOpacity>
        </Link>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  inner: { flex: 1, justifyContent: "center", paddingHorizontal: 24 },
  title: { fontSize: 28, fontWeight: "700", marginBottom: 4, color: "#1a1a1a" },
  subtitle: { fontSize: 16, color: "#666", marginBottom: 32 },
  error: { color: "#dc2626", marginBottom: 16, fontSize: 14 },
  input: {
    borderWidth: 1, borderColor: "#ddd", borderRadius: 12,
    padding: 16, fontSize: 16, marginBottom: 12, backgroundColor: "#f9f9f9",
  },
  button: {
    backgroundColor: "#1e40af", borderRadius: 12,
    padding: 16, alignItems: "center", marginTop: 8,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  link: { marginTop: 24, alignItems: "center" },
  linkText: { fontSize: 14, color: "#666" },
  linkBold: { color: "#2563eb", fontWeight: "600" },
});
