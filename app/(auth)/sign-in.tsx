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

export default function SignInScreen() {
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

        if (role === "agent") {
          // Activate then immediately sign out to destroy the session
          await setActive({ session: result.createdSessionId });
          await signOut();
          Alert.alert(
            "Wrong login",
            "You are an agent. Please use the Agent Login screen.",
          );
          setLoading(false);
          return;
        }

        // Role is customer or user not in DB yet — proceed
        setAuthTarget("/(customer)/map");
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
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to your account</Text>

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
          accessibilityLabel="Sign in"
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Sign In</Text>
          )}
        </TouchableOpacity>

        <Link href="/(auth)/sign-up" asChild>
          <TouchableOpacity style={styles.link} accessibilityRole="link">
            <Text style={styles.linkText}>
              Don't have an account? <Text style={styles.linkBold}>Sign Up</Text>
            </Text>
          </TouchableOpacity>
        </Link>

        <Link href="/(auth)/agent-sign-in" asChild>
          <TouchableOpacity style={styles.agentLink} accessibilityRole="link">
            <Text style={styles.agentLinkText}>Are you an agent?</Text>
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
    backgroundColor: "#2563eb", borderRadius: 12,
    padding: 16, alignItems: "center", marginTop: 8,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  link: { marginTop: 24, alignItems: "center" },
  linkText: { fontSize: 14, color: "#666" },
  linkBold: { color: "#2563eb", fontWeight: "600" },
  agentLink: { marginTop: 16, alignItems: "center" },
  agentLinkText: { fontSize: 14, color: "#1e40af", fontWeight: "600" },
});
