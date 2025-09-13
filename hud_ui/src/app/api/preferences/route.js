import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import User from "../../../../models/User";
import dbConnect from "../../../../lib/mongoose";
import { authOptions } from "../auth/[...nextauth]/route";

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    // console.log(session);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { preference } = await request.json();
    
    if (!preference || preference.trim() === "") {
      return NextResponse.json({ error: "Preference is required" }, { status: 400 });
    }

    await dbConnect();
    
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Add preference to focusAreas if it doesn't already exist
    if (!user.preferences.focusAreas.includes(preference.trim())) {
      user.preferences.focusAreas.push(preference.trim());
      await user.save();
    }

    return NextResponse.json({ 
      success: true, 
      preferences: user.preferences.focusAreas 
    });

  } catch (error) {
    console.error("Error adding preference:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    console.log(session);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ 
      preferences: user.preferences.focusAreas 
    });

  } catch (error) {
    console.error("Error fetching preferences:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
