import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
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

  properties: defineTable({
    agentId: v.id("users"),
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
    views: v.number(),
  })
    .index("by_agent", ["agentId"])
    .index("by_status", ["status"])
    .index("by_type", ["propertyType"]),

  savedProperties: defineTable({
    userId: v.id("users"),
    propertyId: v.id("properties"),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_property", ["userId", "propertyId"]),
});
