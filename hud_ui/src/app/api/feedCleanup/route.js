import dbConnect from "../../../../lib/mongoose";
import FeedItem from "../../../../models/FeedItem";
import Bookmark from "../../../../models/Bookmark";

export async function GET() {
  await dbConnect();

  const cutoff = new Date(Date.now() - 1000 * 60 * 60 * 24 * 30);
  const oldItems = await FeedItem.find({ createdAt: { $lt: cutoff } });

  for (const item of oldItems) {
    const bookmarked = await Bookmark.exists({ itemId: item._id });
    if (!bookmarked) {
      await FeedItem.deleteOne({ _id: item._id });
    }
  }

  return Response.json({ cleaned: true });
}
