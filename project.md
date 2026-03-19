# Real Estate Map Application — Setup Guide

> **Project Stack:** React Native (Expo) · Next.js/Vite · Convex · Clerk · Google Maps API  
> **Important Note on the Clerk + Convex Auth Method:** The old approach of configuring JWT templates in Clerk is **no longer required**. The new approach works like this: you activate the Convex integration inside the Clerk Dashboard, copy your **Frontend API URL** from there, store it as an environment variable (`CLERK_JWT_ISSUER_DOMAIN`), and reference it inside a file called `auth.config.ts` in your `convex/` folder. Running `npx convex dev` syncs that config to the backend — nothing is manually pasted into the Convex Dashboard for auth setup. This guide reflects that updated flow.

---

## Table of Contents

1. [Phase 1 — Project Scaffolding & Environment Setup](#phase-1)
2. [Phase 2 — Clerk Dashboard Configuration](#phase-2)
3. [Phase 3 — Convex Dashboard Configuration](#phase-3)
4. [Phase 4 — Connecting Clerk + Convex & Building the Frontend](#phase-4)

---

## Phase 1 — Project Scaffolding & Environment Setup {#phase-1}

This phase gets both your mobile and web projects created locally and all third-party accounts provisioned before writing any integration code.

### 1.1 Prerequisites

Make sure the following are installed on your machine before proceeding:

- **Node.js** v18 or higher
- **npm** or **yarn**
- **Expo CLI** — `npm install -g expo-cli`
- **Git**
- An Android emulator (Android Studio) or physical device / Xcode (iOS)

### 1.2 Create the Expo Mobile App

```bash
# Bootstrap a new Expo project with TypeScript
npx create-expo-app RealEstateApp --template expo-template-blank-typescript
cd RealEstateApp

# Install core dependencies
npx expo install expo-location expo-maps expo-image-picker
npm install @clerk/clerk-expo convex
```

### 1.3 Create the Web Admin App

In a separate directory (or as a monorepo sibling):

```bash
# Using Vite + React (recommended for a single-page admin portal)
npm create vite@latest real-estate-admin -- --template react-ts
cd real-estate-admin

npm install @clerk/clerk-react convex
```

> **Monorepo tip:** If you want both apps in one repo, use a structure like `/apps/mobile` and `/apps/web` with a root `package.json` and a tool like Turborepo or Nx.

### 1.4 Sign Up for Third-Party Services

Create accounts on all three platforms before moving to Phase 2:

| Service | Purpose | URL |
|---|---|---|
| **Clerk** | Authentication & identity management | https://clerk.com |
| **Convex** | Serverless backend & real-time database | https://convex.dev |
| **Google Cloud** | Maps & Geolocation API | https://console.cloud.google.com |

### 1.5 Enable Google Maps API

1. Go to Google Cloud Console → **APIs & Services → Library**
2. Enable the following:
   - **Maps SDK for Android**
   - **Maps SDK for iOS**
   - **Geocoding API**
   - **Places API**
3. Create an API Key under **Credentials**
4. Store it in your `.env` file (do **not** commit this to git):

```env
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here
```

### 1.6 Folder Structure Reference

```
RealEstateApp/
├── app/                    # Expo Router screens
│   ├── (agent)/            # Agent-specific screens
│   ├── (customer)/         # Customer-specific screens
│   └── (auth)/             # Login / signup screens
├── components/             # Shared UI components
├── convex/                 # All Convex schema, queries, mutations
│   ├── schema.ts
│   ├── users.ts
│   ├── properties.ts
│   └── http.ts             # Webhook handler — for syncing user data to DB (NOT for auth)
├── hooks/                  # Custom hooks (useRole, useProperty, etc.)
└── .env.local
```

---

## Phase 2 — Clerk Dashboard Configuration {#phase-2}

This phase fully configures your Clerk application — setting up your app, defining roles, and configuring authentication methods.

### 2.1 Create a Clerk Application

1. Log into [clerk.com](https://clerk.com) → Click **"Add Application"**
2. Give it a name: e.g., `RealEstateApp`
3. Select your sign-in methods:
   - ✅ **Email + Password** (required for all roles)
   - ✅ **Google OAuth** (for Customers only — disable for Agent/Admin flows)
4. Click **Create Application**

Clerk will generate two keys — copy them now:

```env
# .env.local (Mobile)
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxx

# .env.local (Web Admin)
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxxx

# Secret key — server/backend use only, never expose to client
CLERK_SECRET_KEY=sk_test_xxxx
```

### 2.2 Configure User Roles via Public Metadata

Clerk does not have a built-in "roles" field — roles are stored in `publicMetadata`. You will define three roles: `admin`, `agent`, `customer`.

**Assign the first Admin manually:**

1. In Clerk Dashboard → **Users** → find your own account
2. Click the user → scroll to **Public Metadata**
3. Edit and paste:
```json
{
  "role": "admin"
}
```
4. Save. This is a one-time action. All future agents are created programmatically (see Phase 4).

### 2.3 Configure Allowed Redirect URLs

1. In Clerk Dashboard → **Paths** (or **Redirect URLs**)
2. Add your development URLs:
   - `exp://localhost:8081` (Expo Go)
   - `http://localhost:5173` (Vite web admin)
3. Add your production URLs when ready to deploy

### 2.4 Restrict Google OAuth to Customers Only (Optional but Recommended)

Since Agents and Admins should only log in with email/password for security:

1. Go to **User & Authentication → Social Connections**
2. Keep Google enabled
3. You will enforce the role restriction in code on the mobile app's routing logic (covered in Phase 4) — Clerk itself does not gate OAuth by role

### 2.6 Activate the Convex Integration in Clerk & Get Your Frontend API URL

This is the step that links Clerk to Convex. It must be done in the Clerk Dashboard before any Convex configuration.

1. In the Clerk Dashboard, navigate to the **Integrations** section (also accessible at `dashboard.clerk.com/apps/setup/convex`)
2. Find **Convex** and activate it
3. Once activated, Clerk will display your app's **Frontend API URL** — copy this value
   - In development it looks like: `https://verb-noun-00.clerk.accounts.dev`
   - In production it looks like: `https://clerk.your-domain.com`
4. Store this in your `.env` file as:

```env
CLERK_JWT_ISSUER_DOMAIN=https://verb-noun-00.clerk.accounts.dev
```

> You will use this value in the next phase when configuring Convex. Do **not** skip this step — Convex needs this URL to know which Clerk instance to trust when validating tokens.

### 2.7 Enable the Clerk Backend API (For Agent Provisioning)

The Admin web portal needs to programmatically create Agent accounts. This uses Clerk's Backend API.

1. In Clerk Dashboard → **API Keys** → copy the **Secret Key** (`sk_test_xxxx`)
2. Store it **only** on the server side — never in frontend code:

```env
# Web admin backend / API route only
CLERK_SECRET_KEY=sk_test_xxxx
```

This key will be used in a server-side API route to call Clerk's Backend API to:
- Create the agent account programmatically
- Set `publicMetadata: { role: "agent" }` at creation time
- The webhook will then automatically fire and sync the new agent into the Convex `users` table

---

## Phase 3 — Convex Dashboard Configuration {#phase-3}

This phase sets up your Convex project, defines the database schema, and enables the native Clerk integration.

### 3.1 Create a Convex Project

1. Log into [convex.dev](https://convex.dev) → Click **"New Project"**
2. Name it (e.g., `real-estate-app`)
3. In your terminal, inside your project folder, run:

```bash
npx convex dev
```

This will:
- Prompt you to log in to Convex
- Link your local project to the Convex dashboard project
- Generate a `CONVEX_DEPLOYMENT` URL and a `convex.json` file

Copy the deployment URL to your `.env`:

```env
EXPO_PUBLIC_CONVEX_URL=https://xxxxx.convex.cloud
VITE_CONVEX_URL=https://xxxxx.convex.cloud
```

### 3.2 Configure Convex to Trust Clerk (The Correct New Method)

> ⚠️ **Critical correction from the old approach.** You do NOT paste anything into the Convex Dashboard UI for auth setup. The configuration is done entirely through a file in your codebase called `auth.config.ts`, which Convex reads and syncs when you run `npx convex dev`.

**How it works:**

Convex needs to know which authentication provider to trust. You tell it by creating a file at `convex/auth.config.ts`. This file specifies the `domain` (your Clerk Frontend API URL from step 2.6) and the `applicationID` which is always set to `"convex"` for this integration.

**Steps:**

1. Inside your project's `convex/` folder, create a new file: `auth.config.ts`
2. In that file, set the `domain` to use your `CLERK_JWT_ISSUER_DOMAIN` environment variable and the `applicationID` to `"convex"`
3. Save the file
4. Run `npx convex dev` in your terminal — this automatically syncs the new config to your Convex backend

That's all that's needed for the authentication link. Convex will now be able to validate tokens issued by your Clerk instance. No dashboard UI steps. No copying and pasting URLs into Convex. The file + `npx convex dev` is the entire process.

> **Dev vs Prod environments:** For your development Convex deployment, set `CLERK_JWT_ISSUER_DOMAIN` to your Clerk dev instance URL in the Convex Dashboard under **Settings → Environment Variables** for the dev deployment. For production, switch to the production deployment in the Convex Dashboard and set the production Clerk URL there. Running `npx convex deploy` syncs the production config.

### 3.3 Define the Convex Database Schema

Create `convex/schema.ts`:

```typescript
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Mirrors Clerk users — synced via webhook
  users: defineTable({
    clerkId: v.string(),        // Clerk's user ID (e.g., "user_xxxx")
    email: v.string(),
    name: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    phone: v.optional(v.string()),
    role: v.union(
      v.literal("admin"),
      v.literal("agent"),
      v.literal("customer")
    ),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_role", ["role"]),

  // Property listings created by agents
  properties: defineTable({
    agentId: v.id("users"),      // Reference to the agent who owns this
    title: v.string(),
    description: v.string(),
    price: v.number(),
    area: v.number(),            // In Sq Ft or Acres
    propertyType: v.union(
      v.literal("land"),
      v.literal("apartment"),
      v.literal("villa"),
      v.literal("commercial")
    ),
    status: v.union(
      v.literal("for_sale"),
      v.literal("for_rent"),
      v.literal("sold"),
      v.literal("hidden")
    ),
    latitude: v.number(),
    longitude: v.number(),
    address: v.string(),
    imageIds: v.array(v.id("_storage")), // Convex Storage IDs
    views: v.number(),
  })
    .index("by_agent", ["agentId"])
    .index("by_status", ["status"])
    .index("by_type", ["propertyType"]),

  // Properties saved/favourited by customers
  savedProperties: defineTable({
    userId: v.id("users"),
    propertyId: v.id("properties"),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_property", ["userId", "propertyId"]),
});
```

### 3.4 Push the Schema to Convex

```bash
npx convex dev
```

Running `convex dev` in watch mode will automatically push schema changes to the cloud. You should see your tables appear in the Convex Dashboard under **Data**.

### 3.5 Configure Convex Storage (For Property Images)

No extra setup is needed — Convex Storage is enabled by default. You will use the following pattern in your mutations to generate upload URLs:

```typescript
// convex/properties.ts
export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});
```

---

## Phase 4 — Connecting Clerk + Convex & Building the Frontend {#phase-4}

This phase wires everything together on the code side. Before diving in, one important distinction to keep in mind:

> **Authentication vs User Data Sync — These are two separate things.**
>
> - **Authentication** (making sure Clerk tokens are trusted by Convex) is already handled by the `auth.config.ts` file you set up in Phase 3. It is fully automatic — `ConvexProviderWithClerk` handles token passing and Convex validates it. No webhook needed for this.
>
> - **User Data Sync** (storing a user record with their role in the Convex `users` table) is a *separate* concern. This is what the Clerk webhook is for. When a user is created in Clerk, the webhook fires, your Convex HTTP Action receives it, and it writes a record into your database. This is needed so the app can read roles, build lead lists, and link properties to agents — but it has nothing to do with auth working.

### 4.1 Set Up the Clerk Webhook → Convex User Sync

When a user registers in Clerk, Convex needs to know about them. This is handled by a Convex HTTP Action that receives Clerk's webhook.

**Step 1: Create the HTTP Action in Convex**

Create `convex/http.ts`:

```typescript
import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { Webhook } from "svix";
import { api } from "./_generated/api";

const http = httpRouter();

http.route({
  path: "/clerk-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
    if (!webhookSecret) throw new Error("CLERK_WEBHOOK_SECRET not set");

    // Verify the webhook signature using Svix
    const svix_id = request.headers.get("svix-id");
    const svix_timestamp = request.headers.get("svix-timestamp");
    const svix_signature = request.headers.get("svix-signature");

    const body = await request.text();
    const wh = new Webhook(webhookSecret);

    let evt: any;
    try {
      evt = wh.verify(body, {
        "svix-id": svix_id!,
        "svix-timestamp": svix_timestamp!,
        "svix-signature": svix_signature!,
      });
    } catch (err) {
      return new Response("Invalid webhook signature", { status: 400 });
    }

    // Handle user.created and user.updated events
    const { id, email_addresses, first_name, last_name, public_metadata, image_url } = evt.data;
    const email = email_addresses[0]?.email_address ?? "";
    const role = (public_metadata?.role as string) ?? "customer";
    const name = [first_name, last_name].filter(Boolean).join(" ");

    if (evt.type === "user.created" || evt.type === "user.updated") {
      await ctx.runMutation(api.users.upsertUser, {
        clerkId: id,
        email,
        name,
        avatarUrl: image_url,
        role: role as "admin" | "agent" | "customer",
      });
    }

    if (evt.type === "user.deleted") {
      await ctx.runMutation(api.users.deleteUser, { clerkId: id });
    }

    return new Response(null, { status: 200 });
  }),
});

export default http;
```

**Step 2: Create the `users` Mutations in Convex**

Create `convex/users.ts`:

```typescript
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const upsertUser = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    role: v.union(v.literal("admin"), v.literal("agent"), v.literal("customer")),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, args);
    } else {
      await ctx.db.insert("users", args);
    }
  },
});

export const deleteUser = mutation({
  args: { clerkId: v.string() },
  handler: async (ctx, { clerkId }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .unique();
    if (user) await ctx.db.delete(user._id);
  },
});

export const getMe = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    return ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
  },
});
```

**Step 3: Register the Webhook in Clerk**

1. In Clerk Dashboard → **Webhooks** → **Add Endpoint**
2. URL: `https://your-project.convex.site/clerk-webhook`
   - Find your `.convex.site` URL in Convex Dashboard → **Settings → URL & Deploy Key**
3. Select events to subscribe to:
   - ✅ `user.created`
   - ✅ `user.updated`
   - ✅ `user.deleted`
4. Copy the **Signing Secret** and add it to Convex:
   - Convex Dashboard → **Settings → Environment Variables**
   - Add: `CLERK_WEBHOOK_SECRET = whsec_xxxx`

### 4.2 Wire Up Providers in the Mobile App

Update your root `app/_layout.tsx`:

```tsx
import { ClerkProvider, useAuth } from "@clerk/clerk-expo";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";
import * as SecureStore from "expo-secure-store";

const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!);

const tokenCache = {
  async getToken(key: string) {
    return SecureStore.getItemAsync(key);
  },
  async saveToken(key: string, value: string) {
    return SecureStore.setItemAsync(key, value);
  },
};

export default function RootLayout() {
  return (
    <ClerkProvider
      publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!}
      tokenCache={tokenCache}
    >
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        {/* Your navigation stack goes here */}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
```

> **How this works:** `ConvexProviderWithClerk` from `convex/react-clerk` automatically fetches the Clerk auth token and passes it to Convex with every request. Convex then validates it against the `auth.config.ts` configuration you set up in Phase 3. This is entirely automatic — no manual token handling needed in your app code.

### 4.3 Implement RBAC Routing

Create a custom hook `hooks/useRole.ts`:

```typescript
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function useRole() {
  const user = useQuery(api.users.getMe);
  return {
    role: user?.role ?? null,
    isAdmin: user?.role === "admin",
    isAgent: user?.role === "agent",
    isCustomer: user?.role === "customer",
    isLoading: user === undefined,
  };
}
```

Use this in your navigation layout to route users after login:

```tsx
// app/(auth)/callback.tsx — runs after successful Clerk sign-in
import { useRole } from "@/hooks/useRole";
import { Redirect } from "expo-router";

export default function AuthCallback() {
  const { role, isLoading } = useRole();

  if (isLoading) return <LoadingScreen />;
  if (role === "agent") return <Redirect href="/(agent)/dashboard" />;
  if (role === "customer") return <Redirect href="/(customer)/map" />;
  if (role === "admin") {
    // Admins should not be in the mobile app
    // Sign them out immediately
    signOut();
    return <Redirect href="/(auth)/login" />;
  }
}
```

### 4.4 Wire Up Providers in the Web Admin App

Update `main.tsx`:

```tsx
import { ClerkProvider } from "@clerk/clerk-react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";
import { useAuth } from "@clerk/clerk-react";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL);

function App() {
  return (
    <ClerkProvider publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <AdminPortal />
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
```

### 4.5 Agent Provisioning (Admin Web Portal)

The Admin creates Agent accounts via a form that calls a secure API route. This calls the Clerk Backend API directly.

```typescript
// api/create-agent.ts (Next.js API Route or Vite backend endpoint)
import { clerkClient } from "@clerk/clerk-sdk-node";

export async function POST(request: Request) {
  const { name, email, phone } = await request.json();

  // Generate a secure temporary password
  const tempPassword = crypto.randomUUID().replace(/-/g, "").slice(0, 16) + "A1!";

  const user = await clerkClient.users.createUser({
    emailAddress: [email],
    password: tempPassword,
    firstName: name.split(" ")[0],
    lastName: name.split(" ").slice(1).join(" "),
    publicMetadata: { role: "agent" },
  });

  // Clerk automatically fires user.created webhook → Convex syncs the user

  return Response.json({ success: true, userId: user.id });
}
```

### 4.6 Building the Core UI Modules

With the backend fully wired, here is a summary of what to build per role:

#### Customer Map Screen (Core Feature)

```
/(customer)/map.tsx
- Full-screen MapView from expo-maps
- useQuery(api.properties.getByBoundingBox, { bounds }) — refreshes on map move
- Custom price markers on each pin
- Cluster markers when zoomed out (react-native-maps clustering)
- Bottom sheet (react-native-bottom-sheet) showing list view
- "Locate Me" button using expo-location
- Filter sheet (Price Range, Type, Status)
```

#### Agent Dashboard

```
/(agent)/dashboard.tsx
- Stats: total listings, total views
- Lead list: users who saved their properties
  → useQuery(api.properties.getAgentLeads)

/(agent)/add-listing.tsx
- "Add Listing Here" button calls expo-location getCurrentPositionAsync()
- Multi-step form wizard
- Image upload via expo-image-picker → Convex Storage
```

#### Admin Portal (Web)

```
/admin/agents.tsx
- Table of all agents (useQuery(api.users.getAgents))
- "Create Agent" form → POST to /api/create-agent
- Clerk webhook handles the Convex sync automatically
```

---

## Quick Reference: Environment Variables Checklist

| Variable | Used In | Where to Get It |
|---|---|---|
| `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` | Mobile | Clerk Dashboard → API Keys |
| `VITE_CLERK_PUBLISHABLE_KEY` | Web Admin | Clerk Dashboard → API Keys |
| `CLERK_SECRET_KEY` | Server only | Clerk Dashboard → API Keys |
| `CLERK_JWT_ISSUER_DOMAIN` | `convex/auth.config.ts` | Clerk Dashboard → Integrations → Convex (Frontend API URL) |
| `CLERK_WEBHOOK_SECRET` | Convex env vars | Clerk Dashboard → Webhooks → Signing Secret |
| `EXPO_PUBLIC_CONVEX_URL` | Mobile | Convex Dashboard → Settings |
| `VITE_CONVEX_URL` | Web Admin | Convex Dashboard → Settings |
| `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` | Mobile | Google Cloud Console |

---

## Summary of the Integration Flow

### Stream 1 — Authentication (Automatic, No Webhook Needed)

```
User logs in via Clerk (Mobile or Web)
        │
        ▼
ClerkProvider detects successful login
        │
        ▼
ConvexProviderWithClerk fetches a signed auth token from Clerk
        │
        ▼
Token is passed automatically to Convex with every query/mutation
        │
        ▼
Convex validates the token against auth.config.ts
(checks the token signature using Clerk's public key)
        │
        ▼
ctx.auth.getUserIdentity() is now available in all Convex functions
useConvexAuth() returns isAuthenticated: true on the frontend
```

### Stream 2 — User Data Sync (Webhook — Needed for Roles & DB Records)

```
New user registers in Clerk
        │
        ▼
Clerk fires user.created webhook → hits your Convex HTTP Action endpoint
        │
        ▼
Convex verifies the webhook signature (Svix)
        │
        ▼
Extracts clerkId, email, name, and role from publicMetadata
        │
        ▼
Upserts a record into the Convex `users` table
        │
        ▼
useRole() hook can now read the role from the DB
→ Routes the user to Agent Interface or Customer Interface
```

---

*Last updated to reflect the correct Clerk + Convex integration method — auth configured via `convex/auth.config.ts`, not the Convex Dashboard UI. User data sync via webhooks is a separate concern from authentication.*