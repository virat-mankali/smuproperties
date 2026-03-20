import { useSignUp } from "@clerk/clerk-expo";
import { Link } from "expo-router";
import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { setAuthTarget } from "../../hooks/useAuthTarget";

export default function SignUpScreen() {
  const { signUp, setActive, isLoaded } = useSignUp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSignUp = async () => {
    if (!isLoaded) return;
    setError("");
    setLoading(true);
    try {
      await signUp.create({ emailAddress: email, password });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setPendingVerification(true);
    } catch (err: any) {
      setError(err.errors?.[0]?.message ?? "Sign up failed");
    } finally {
      setLoading(false);
    }
  };

  const onVerify = async () => {
    if (!isLoaded) return;
    setError("");
    setLoading(true);
    try {
      const result = await signUp.attemptEmailAddressVerification({ code });
      if (result.status === "complete") {
        setAuthTarget("/(customer)/map");
        await setActive({ session: result.createdSessionId });
        // Navigation is handled by the useEffect in _layout.tsx
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message ?? "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  if (pendingVerification) {
    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.inner}>
          <Text style={styles.title}>Verify Email</Text>
          <Text style={styles.subtitle}>Enter the code sent to {email}</Text>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <TextInput
            style={styles.input}
            placeholder="Verification code"
            value={code}
            onChangeText={setCode}
            keyboardType="number-pad"
            accessibilityLabel="Verification code"
          />
          <TouchableOpacity
            style={styles.button}
            onPress={onVerify}
            disabled={loading}
            accessibilityRole="button"
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Verify</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.inner}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Sign up to get started</Text>
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
          onPress={onSignUp}
          disabled={loading}
          accessibilityRole="button"
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Sign Up</Text>
          )}
        </TouchableOpacity>
        <Link href="/(auth)/sign-in" asChild>
          <TouchableOpacity style={styles.link} accessibilityRole="link">
            <Text style={styles.linkText}>
              Already have an account? <Text style={styles.linkBold}>Sign In</Text>
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
    backgroundColor: "#2563eb", borderRadius: 12,
    padding: 16, alignItems: "center", marginTop: 8,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  link: { marginTop: 24, alignItems: "center" },
  linkText: { fontSize: 14, color: "#666" },
  linkBold: { color: "#2563eb", fontWeight: "600" },
});
