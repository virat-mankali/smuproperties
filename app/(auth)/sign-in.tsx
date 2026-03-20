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
  ScrollView,
  Image,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { setAuthTarget } from "../../hooks/useAuthTarget";

export default function SignInScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const { signOut } = useClerk();
  const convex = useConvex();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
        const role = await convex.query(api.users.getRoleByEmail, { email });

        if (role === "agent") {
          await setActive({ session: result.createdSessionId });
          await signOut();
          Alert.alert(
            "Wrong login",
            "You are an agent. Please use the Agent Login screen.",
          );
          setLoading(false);
          return;
        }

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
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Image
          source={{ uri: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80" }}
          style={styles.heroImage}
          resizeMode="cover"
        />
        <View style={styles.card}>
          <Image
            source={require("../../assets/SMUWhiteLogo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>
            Enter your details below to log back into{"\n"}your account
          </Text>
          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={styles.inputWrapper}>
            <Ionicons name="mail-outline" size={20} color="#9b8fb8" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email address"
              placeholderTextColor="#b0a4c8"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              accessibilityLabel="Email address"
            />
          </View>

          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={20} color="#9b8fb8" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#b0a4c8"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              accessibilityLabel="Password"
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}
              accessibilityLabel={showPassword ? "Hide password" : "Show password"}
            >
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={22}
                color="#9b8fb8"
              />
            </TouchableOpacity>
          </View>

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
              <Text style={styles.buttonText}>Let's Start</Text>
            )}
          </TouchableOpacity>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>Or Log In With</Text>
            <View style={styles.dividerLine} />
          </View>

          <Link href="/(auth)/sign-up" asChild>
            <TouchableOpacity style={styles.link} accessibilityRole="link">
              <Text style={styles.linkText}>
                Don't have an account?{" "}
                <Text style={styles.linkBold}>Sign up</Text>
              </Text>
            </TouchableOpacity>
          </Link>

          <Link href="/(auth)/agent-sign-in" asChild>
            <TouchableOpacity style={styles.agentLink} accessibilityRole="link">
              <Text style={styles.agentLinkText}>Are you an agent?</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e8dff5",
  },
  scrollContent: {
    flexGrow: 1,
  },
  card: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 28,
    paddingTop: 32,
    paddingBottom: 40,
    alignItems: "center",
    flexGrow: 1,
  },
  logo: {
    width: 100,
    height: 60,
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  error: {
    color: "#dc2626",
    marginBottom: 12,
    fontSize: 13,
    textAlign: "center",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f2fa",
    borderRadius: 14,
    paddingHorizontal: 14,
    marginBottom: 12,
    width: "100%",
    height: 52,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#333",
    height: "100%",
  },
  eyeIcon: {
    padding: 4,
  },
  heroImage: {
    width: "100%",
    height: 220,
  },
  button: {
    backgroundColor: "#7c3aed",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    width: "100%",
    marginTop: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#e0dce6",
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 13,
    color: "#999",
  },
  link: {
    marginTop: 4,
    alignItems: "center",
  },
  linkText: {
    fontSize: 14,
    color: "#666",
  },
  linkBold: {
    color: "#7c3aed",
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  agentLink: {
    marginTop: 16,
    alignItems: "center",
  },
  agentLinkText: {
    fontSize: 14,
    color: "#7c3aed",
    fontWeight: "600",
  },
});
