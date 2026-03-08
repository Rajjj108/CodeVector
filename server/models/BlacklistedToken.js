import mongoose from "mongoose";

/**
 * BlacklistedToken — stores sha256 hashes of invalidated JWTs.
 * MongoDB automatically purges documents when `expiresAt` passes
 * (TTL index with expireAfterSeconds: 0).
 */
const blacklistedTokenSchema = new mongoose.Schema({
  tokenHash: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 }, // TTL — auto-delete when expiresAt is reached
  },
});

export default mongoose.model("BlacklistedToken", blacklistedTokenSchema);
