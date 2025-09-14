import mongoose from "mongoose";

const FeedItemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    url: { type: String, required: true },
    source: { type: String, required: true }, // e.g. "HackerNews", "RundownAI", "X"
    popularity: { type: Number, default: 0 }, // e.g. HN points, tweet likes
    tags: [String], // e.g. ["AI", "Startups"]
    publishedAt: { type: Date, required: true },
  },
  { timestamps: true }
);

FeedItemSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 30 });

export default mongoose.models.FeedItem ||
  mongoose.model("FeedItem", FeedItemSchema);
