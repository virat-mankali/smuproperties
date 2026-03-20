import { query } from "./_generated/server";
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
