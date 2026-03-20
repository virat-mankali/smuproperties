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
  ScrollView,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { setAuthTarget } from "../../hooks/useAuthTarget";

export default function SignUpScreen() {
  const { signUp, setActive, isLoaded } = useSignUp();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSignUp = async () => {
    if (!isLoaded) return;
    setError("");
    setLoading(true);
    try {
      await signUp.create({
        emailAddress: email,
        password,
        firstName,
        lastName,
      });
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
            <Text style={styles.title}>Verify Email</Text>
            <Text style={styles.subtitle}>
              Enter the code sent to {email}
            </Text>
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <View style={styles.inputWrapper}>
              <Ionicons name="keypad-outline" size={20} color="#9b8fb8" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Verification code"
                placeholderTextColor="#b0a4c8"
                value={code}
                onChangeText={setCode}
                keyboardType="number-pad"
                accessibilityLabel="Verification code"
              />
            </View>
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
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

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
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>
            Fill in your details below to get started{"\n"}with your new account
          </Text>
          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={styles.nameRow}>
            <View style={[styles.inputWrapper, styles.nameInput]}>
              <Ionicons name="person-outline" size={20} color="#9b8fb8" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="First name"
                placeholderTextColor="#b0a4c8"
                value={firstName}
                onChangeText={setFirstName}
                accessibilityLabel="First name"
              />
            </View>
            <View style={[styles.inputWrapper, styles.nameInput]}>
              <Ionicons name="person-outline" size={20} color="#9b8fb8" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Last name"
                placeholderTextColor="#b0a4c8"
                value={lastName}
                onChangeText={setLastName}
                accessibilityLabel="Last name"
              />
            </View>
          </View>

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
            onPress={onSignUp}
            disabled={loading}
            accessibilityRole="button"
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Create Account</Text>
            )}
          </TouchableOpacity>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>Or Sign Up With</Text>
            <View style={styles.dividerLine} />
          </View>

          <Link href="/(auth)/sign-in" asChild>
            <TouchableOpacity style={styles.link} accessibilityRole="link">
              <Text style={styles.linkText}>
                Already have an account?{" "}
                <Text style={styles.linkBold}>Log in</Text>
              </Text>
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
  nameRow: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
    marginBottom: 12,
  },
  nameInput: {
    flex: 1,
    marginBottom: 0,
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
});
