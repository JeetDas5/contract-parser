import mongoose from "mongoose";

const URI = process.env.MONGO_URI as string;

if (!URI) {
  throw new Error("MONGO_URI is not defined");
}

declare global {
  var _mongoose:
    | {
        conn: typeof mongoose | null;
        promise: Promise<typeof mongoose> | null;
      }
    | undefined;
}

let cached =
  global._mongoose ?? (global._mongoose = { conn: null, promise: null });

export default async function connectDB(): Promise<typeof mongoose> {
  try {
    if (cached.conn) {
      return cached.conn;
    }

    if (!cached.promise) {
      const opts = {
        bufferCommands: false,
      };

      cached.promise = mongoose.connect(URI, opts).then((mongooseInstance) => {
        return mongooseInstance;
      });
    }

    cached.conn = await cached.promise;
    console.log("Database connected successfully");
    return cached.conn;
  } catch (error) {
    console.error("Database Connection Error:", error);
    throw new Error("Database connection failed");
  }
}

export async function disconnectDb(): Promise<void> {
  await mongoose.disconnect();
  cached = global._mongoose = { conn: null, promise: null };
}
