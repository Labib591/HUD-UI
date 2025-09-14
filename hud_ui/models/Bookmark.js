import mongoose from "mongoose";

const Bookmark = new mongoose.Schema({
    itemId: { type: mongoose.Schema.Types.ObjectId, ref: "FeedItem" },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
},
{ timestamps: true });

export default mongoose.models.Bookmark || mongoose.model("Bookmark", Bookmark);
