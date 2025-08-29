import connectDB from "@/lib/db";
import mongoose from "mongoose";

let gfs: mongoose.mongo.GridFSBucket | null = null;

export async function getGridFSBucket() {
  await connectDB();
  if (!gfs) {
    const conn = mongoose.connection;

    if (!conn.db) {
      throw new Error("Database connection is not established.");
    }
    gfs = new mongoose.mongo.GridFSBucket(conn.db, {
      bucketName: "contracts",
    });
  }
  return gfs;
}

export async function getFileFromGridFS(fileId: mongoose.Types.ObjectId) {
  const bucket = await getGridFSBucket();
  const downloadStream = bucket.openDownloadStream(fileId);

  const chunks: Buffer[] = [];

  return new Promise<Buffer>((resolve, reject) => {
    downloadStream.on("data", (chunk) => {
      chunks.push(chunk);
    });
    downloadStream.on("error", () => {
      reject(new Error("Failed to download file"));
    });
    downloadStream.on("end", () => {
      resolve(Buffer.concat(chunks));
    });
  });
}
