import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import dbConnect from "../../../../lib/mongoose";
import User from "../../../../models/User";
import FeedItem from "../../../../models/FeedItem";


export async function GET() {
  await dbConnect();
  const session = await getServerSession();

  let items;

  if (session?.user?.email) {
    const user = await User.findOne({ email: session.user.email });
    if (user?.preferences?.focusAreas?.length > 0) {
      items = await FeedItem.find({
        tags: { $in: user.preferences.focusAreas.map(area => area.toLowerCase()) },
      })
        .sort({ publishedAt: -1 })
        .limit(50)
        .lean();
    } else {
      items = await FeedItem.find().sort({ publishedAt: -1 }).limit(50).lean();
    }
  } else {
    items = await FeedItem.find().sort({ publishedAt: -1 }).limit(50).lean();
  }

  return NextResponse.json({ items });
}
