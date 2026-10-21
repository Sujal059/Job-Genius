import mongoose from "mongoose";

/**
 * Opens the Mongoose connection. Called once from server.js on boot.
 * We fail fast (and loudly) if MongoDB is unreachable instead of letting
 * the API start in a half-working state.
 */
export async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error(
      "MONGODB_URI is not set. Copy .env.example to .env and fill it in."
    );
  }

  mongoose.set("strictQuery", true);

  mongoose.connection.on("disconnected", () => {
    console.warn("[mongo] disconnected");
  });
  mongoose.connection.on("reconnected", () => {
    console.info("[mongo] reconnected");
  });

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 8000,
  });

  console.info(`[mongo] connected → ${mongoose.connection.name}`);
}

export default connectDB;
