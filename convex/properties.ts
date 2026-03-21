import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const listPublic = query({
  args: {
    propertyType: v.optional(
      v.union(
        v.literal("land"),
        v.literal("apartment"),
        v.literal("villa"),
        v.literal("commercial"),
        v.literal("all")
      )
    ),
  },
  handler: async (ctx, { propertyType }) => {
    let q = ctx.db
      .query("properties")
      .withIndex("by_status", (q) => q.eq("status", "for_sale"))
      .order("desc");

    const results = await q.collect();

    const filtered =
      !propertyType || propertyType === "all"
        ? results
        : results.filter((p) => p.propertyType === propertyType);

    // Attach agent info and first image URL
    return Promise.all(
      filtered.map(async (p) => {
        const agent = await ctx.db.get(p.agentId);
        const imageUrl =
          p.imageIds.length > 0
            ? await ctx.storage.getUrl(p.imageIds[0])
            : null;
        return { ...p, agentName: agent?.name ?? "Agent", imageUrl };
      })
    );
  },
});

// Agent: list their own properties
export const listByAgent = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) return [];

    const results = await ctx.db
      .query("properties")
      .withIndex("by_agent", (q) => q.eq("agentId", user._id))
      .order("desc")
      .collect();

    return Promise.all(
      results.map(async (p) => {
        const imageUrl =
          p.imageIds.length > 0 ? await ctx.storage.getUrl(p.imageIds[0]) : null;
        return { ...p, imageUrl };
      })
    );
  },
});

// Agent: get stats (total listings, total views, leads count)
export const getAgentStats = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { totalListings: 0, totalViews: 0, totalLeads: 0 };
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) return { totalListings: 0, totalViews: 0, totalLeads: 0 };

    const listings = await ctx.db
      .query("properties")
      .withIndex("by_agent", (q) => q.eq("agentId", user._id))
      .collect();

    const totalViews = listings.reduce((sum, p) => sum + (p.views ?? 0), 0);

    // Count unique users who saved any of this agent's properties
    const propertyIds = listings.map((p) => p._id);
    const allSaved = await ctx.db.query("savedProperties").collect();
    const leads = allSaved.filter((s) => propertyIds.includes(s.propertyId));
    const uniqueLeads = new Set(leads.map((l) => l.userId.toString())).size;

    return { totalListings: listings.length, totalViews, totalLeads: uniqueLeads };
  },
});

// Agent: get leads (users who saved their properties)
export const getAgentLeads = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) return [];

    const listings = await ctx.db
      .query("properties")
      .withIndex("by_agent", (q) => q.eq("agentId", user._id))
      .collect();

    const propertyIds = new Set(listings.map((p) => p._id.toString()));
    const allSaved = await ctx.db.query("savedProperties").collect();
    const relevant = allSaved.filter((s) => propertyIds.has(s.propertyId.toString()));

    return Promise.all(
      relevant.map(async (s) => {
        const customer = await ctx.db.get(s.userId);
        const property = await ctx.db.get(s.propertyId);
        return {
          _id: s._id,
          customerName: customer?.name ?? "Unknown",
          customerEmail: customer?.email ?? "",
          customerPhone: customer?.phone ?? null,
          customerAvatar: customer?.avatarUrl ?? null,
          propertyTitle: property?.title ?? "Property",
          propertyId: s.propertyId,
        };
      })
    );
  },
});

// Agent: create a new property listing
export const createProperty = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    price: v.number(),
    area: v.number(),
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
    imageIds: v.array(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user || user.role !== "agent") throw new Error("Not an agent");

    return ctx.db.insert("properties", { ...args, agentId: user._id, views: 0 });
  },
});

// Agent: update a property
export const updateProperty = mutation({
  args: {
    id: v.id("properties"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    price: v.optional(v.number()),
    area: v.optional(v.number()),
    propertyType: v.optional(
      v.union(
        v.literal("land"),
        v.literal("apartment"),
        v.literal("villa"),
        v.literal("commercial")
      )
    ),
    status: v.optional(
      v.union(
        v.literal("for_sale"),
        v.literal("for_rent"),
        v.literal("sold"),
        v.literal("hidden")
      )
    ),
    address: v.optional(v.string()),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
  },
  handler: async (ctx, { id, ...fields }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const property = await ctx.db.get(id);
    if (!property) throw new Error("Not found");
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user || property.agentId.toString() !== user._id.toString())
      throw new Error("Unauthorized");
    await ctx.db.patch(id, fields);
  },
});

// Agent: delete a property
export const deleteProperty = mutation({
  args: { id: v.id("properties") },
  handler: async (ctx, { id }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const property = await ctx.db.get(id);
    if (!property) throw new Error("Not found");
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user || property.agentId.toString() !== user._id.toString())
      throw new Error("Unauthorized");
    await ctx.db.delete(id);
  },
});

// Customer: get their saved properties
export const getSavedByUser = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) return [];

    const saved = await ctx.db
      .query("savedProperties")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const results = await Promise.all(
      saved.map(async (s) => {
        const property = await ctx.db.get(s.propertyId);
        if (!property) return null;
        const imageUrl =
          property.imageIds.length > 0
            ? await ctx.storage.getUrl(property.imageIds[0])
            : null;
        return { ...property, imageUrl, savedId: s._id };
      })
    );
    return results.filter(Boolean);
  },
});

// Customer: toggle save/unsave a property
export const toggleSave = mutation({
  args: { propertyId: v.id("properties") },
  handler: async (ctx, { propertyId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new Error("User not found");

    const existing = await ctx.db
      .query("savedProperties")
      .withIndex("by_user_and_property", (q) =>
        q.eq("userId", user._id).eq("propertyId", propertyId)
      )
      .unique();

    if (existing) {
      await ctx.db.delete(existing._id);
      return { saved: false };
    } else {
      await ctx.db.insert("savedProperties", { userId: user._id, propertyId });
      return { saved: true };
    }
  },
});

export const getById = query({
  args: { id: v.id("properties") },
  handler: async (ctx, { id }) => {
    const property = await ctx.db.get(id);
    if (!property) return null;

    const agent = await ctx.db.get(property.agentId);
    const agentAvatarUrl = agent?.avatarUrl ?? null;

    const imageUrls = await Promise.all(
      property.imageIds.map((imgId) => ctx.storage.getUrl(imgId))
    );

    return {
      ...property,
      agentName: agent?.name ?? "Agent",
      agentAvatarUrl,
      imageUrls: imageUrls.filter(Boolean) as string[],
    };
  },
});
