import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { findCurrentUserId, getOrCreateCurrentUserId } from "./auth_helpers";

export const createLinked = mutation({
  args: {
    chatId: v.string(),
    assistantMessageId: v.id("messages"),
    name: v.string(),
    description: v.string(),
    tsxCode: v.string(),
    htmlCode: v.string(),
  },
  handler: async (ctx, args) => {
    const ownerUserId = await getOrCreateCurrentUserId(ctx);
    const now = Date.now();

    const existing = await ctx.db
      .query("emails")
      .withIndex("by_assistant_message", (q) =>
        q.eq("assistantMessageId", args.assistantMessageId),
      )
      .first();

    if (existing && existing.ownerUserId === ownerUserId) {
      await ctx.db.patch(existing._id, {
        name: args.name,
        description: args.description,
        tsxCode: args.tsxCode,
        htmlCode: args.htmlCode,
        updatedAt: now,
      });
      return existing._id;
    }

    return await ctx.db.insert("emails", {
      ownerUserId,
      chatId: args.chatId,
      assistantMessageId: args.assistantMessageId,
      name: args.name,
      description: args.description,
      tsxCode: args.tsxCode,
      htmlCode: args.htmlCode,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    const ownerUserId = await findCurrentUserId(ctx);
    if (!ownerUserId) {
      return [];
    }

    return await ctx.db
      .query("emails")
      .withIndex("by_owner", (q) => q.eq("ownerUserId", ownerUserId))
      .order("desc")
      .collect();
  },
});

export const getLatestForChat = query({
  args: {
    chatId: v.string(),
  },
  handler: async (ctx, args) => {
    const ownerUserId = await findCurrentUserId(ctx);
    if (!ownerUserId) {
      return null;
    }

    const emails = await ctx.db
      .query("emails")
      .withIndex("by_chat", (q) => q.eq("chatId", args.chatId))
      .collect();

    const owned = emails.filter((email) => email.ownerUserId === ownerUserId);
    owned.sort((a, b) => b.updatedAt - a.updatedAt);
    return owned[0] ?? null;
  },
});

export const remove = mutation({
  args: { id: v.id("emails") },
  handler: async (ctx, args) => {
    const ownerUserId = await findCurrentUserId(ctx);
    if (!ownerUserId) {
      throw new Error("Unauthorized");
    }

    const existing = await ctx.db.get(args.id);
    if (!existing || existing.ownerUserId !== ownerUserId) {
      throw new Error("Unauthorized");
    }

    await ctx.db.delete(args.id);
  },
});
