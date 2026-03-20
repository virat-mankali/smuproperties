import "react-native-get-random-values";
import { ClerkProvider, ClerkLoaded, useAuth } from "@clerk/clerk-expo";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient, useQuery } from "convex/react";
import * as SecureStore from "expo-secure-store";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { hasPendingTarget, consumeAuthTarget } from "../hooks/useAuthTarget";
import { api } from "../convex/_generated/api";

const convex = new ConvexReactClient(
  process.env.EXPO_PUBLIC_CONVEX_URL!
);

const tokenCache = {
  async getToken(key: string) {
    return SecureStore.getItemAsync(key);
  },
  async saveToken(key: string, value: string) {
    return SecureStore.setItemAsync(key, value);
  },
  async clearToken(key: string) {
    return SecureStore.deleteItemAsync(key);
  },
};

function AuthNavigator() {
  const { isSignedIn, isLoaded } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const user = useQuery(api.users.getMe);

  useEffect(() => {
    if (!isLoaded) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (isSignedIn && inAuthGroup) {
      // Fresh sign-in: the sign-in screen set a target → use it immediately
      // This avoids waiting for a potentially stale Convex query cache
      if (hasPendingTarget()) {
        const target = consumeAuthTarget();
        router.replace(target);
        return;
      }

      // Reload scenario: no pending target, wait for fresh user data from DB
      if (user === undefined) return;

      if (user?.role === "agent") {
        router.replace("/(agent)/dashboard");
      } else {
        router.replace("/(customer)/map");
      }
    } else if (!isSignedIn && !inAuthGroup) {
      router.replace("/(auth)/sign-in");
    }
  }, [isSignedIn, isLoaded, segments, user]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(customer)" />
      <Stack.Screen name="(agent)" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <ClerkProvider
      publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!}
      tokenCache={tokenCache}
    >
      <ClerkLoaded>
        <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
          <AuthNavigator />
        </ConvexProviderWithClerk>
      </ClerkLoaded>
    </ClerkProvider>
  );
}
