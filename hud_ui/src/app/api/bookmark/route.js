import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import dbConnect from "../../../../lib/mongoose";
import User from "../../../../models/User";
import Bookmark from "../../../../models/Bookmark";
import FeedItem from "../../../../models/FeedItem";

export async function POST(request) {
    try{
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { _id } = await request.json();
        if (!_id) {
            return NextResponse.json({ error: "Item ID is required" }, { status: 400 });
        }

        await dbConnect();
        const user = await User.findById(session.user.id);
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const bookmark = new Bookmark({
            itemId: _id,
            userId: session.user.id,
        });
        await bookmark.save();

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error bookmarking item:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function GET(request) {
    try{
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();

        // First, get all bookmarks for the user
        const bookmarks = await Bookmark.find({ userId: session.user.id });
        
        // Get all itemIds from bookmarks
        const itemIds = bookmarks.map(b => b.itemId);
        
        // Fetch all feed items in one query
        const feedItems = await FeedItem.find({ _id: { $in: itemIds } });
        
        // Create a map of itemId to feedItem for easy lookup
        const feedItemMap = feedItems.reduce((acc, item) => {
            acc[item._id.toString()] = item;
            return acc;
        }, {});
        
        // Format the response
        const formattedBookmarks = bookmarks
            .filter(bookmark => feedItemMap[bookmark.itemId.toString()])
            .map(bookmark => ({
                ...feedItemMap[bookmark.itemId.toString()].toObject(),
                _id: bookmark.itemId,
                metadata: feedItemMap[bookmark.itemId.toString()].metadata || {}
            }));

        return NextResponse.json({ bookmarks: formattedBookmarks });
    } catch (error) {
        console.error("Error fetching bookmarks:", error);
        return NextResponse.json(
            { error: "Internal server error", details: error.message },
            { status: 500 }
        );
    }
}

export async function DELETE(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { _id } = await request.json();
        if (!_id) {
            return NextResponse.json({ error: "Item ID is required" }, { status: 400 });
        }

        await dbConnect();
        
        // Delete the bookmark
        const result = await Bookmark.findOneAndDelete({
            itemId: _id,
            userId: session.user.id
        });

        if (!result) {
            return NextResponse.json({ error: "Bookmark not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error removing bookmark:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}