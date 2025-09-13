import mongoose from "mongoose";
import bcrypt from "bcrypt";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String }, // from OAuth profile
    email: { type: String, required: true, unique: true },

    // For credentials provider
    password: { type: String },

    // OAuth accounts (Google, GitHub, etc.)
    image: { type: String },
    provider: { type: String }, // e.g. "google", "github", "credentials"
    providerAccountId: { type: String },

    // HUD-specific data
    bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: "FeedItem" }],
    preferences: {
      focusAreas: [String],
      autoScrollSpeed: { type: Number, default: 5 },
      blendRatio: { type: Number, default: 70 },
    },

    apiKeys: {
      openai: { type: String },
    },
  },
  { timestamps: true }
);

// Hash password if set (only for credentials users)
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

export default mongoose.models.User || mongoose.model("User", UserSchema);
