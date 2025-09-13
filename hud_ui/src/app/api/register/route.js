import { NextResponse } from "next/server"
import dbConnect from "../../../../lib/mongoose"
import bcrypt from "bcrypt"
import User from "../../../../models/User"

export async function POST(request) {
  try {
    const { fullName, email, password } = await request.json()

    // Validate required fields
    if (!fullName || !email || !password) {
      return NextResponse.json(
        { error: "Full name, email, and password are required" },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400 }
      )
    }

    // Validate password strength
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    if (!passwordRegex.test(password)) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters with uppercase, lowercase, number, and special character" },
        { status: 400 }
      )
    }

    // Connect to database
    await dbConnect()

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      )
    }

    // Create new user
    const newUser = new User({
      name: fullName,
      email,
      password,
      provider: "credentials"
    })

    // Save user to database
    await newUser.save()

    // Return success response (without password)
    const userResponse = {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      provider: newUser.provider,
      createdAt: newUser.createdAt
    }

    return NextResponse.json(
      { 
        message: "User registered successfully",
        user: userResponse
      },
      { status: 201 }
    )

  } catch (error) {
    console.error("Registration error:", error)
    
    // Handle specific database errors
    if (error.code === 11000) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: "Internal server error. Please try again." },
      { status: 500 }
    )
  }
}
