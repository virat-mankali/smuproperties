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
    } catch {
      return new Response("Invalid webhook signature", { status: 400 });
    }

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
