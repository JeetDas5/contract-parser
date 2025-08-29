import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { GridFSBucket, ObjectId } from "mongodb";
import connectDB from "@/lib/db";
import Contract from "@/models/Contract";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  await connectDB();

  try {
    const db = mongoose.connection.db;

    if (!db) {
      return NextResponse.json(
        { error: "Database not connected" },
        { status: 500 }
      );
    }

    const bucket = new GridFSBucket(db, { bucketName: "contracts" });

    const { id: contractId } = await params;
    const contract = await Contract.findById(contractId);

    if (!contract) {
      return NextResponse.json(
        { error: "Contract not found" },
        { status: 404 }
      );
    }

    const fileId = contract.file_id;

    const files = await db
      .collection("contracts.files")
      .find({ _id: fileId })
      .toArray();

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const file = files[0];
    const stream = bucket.openDownloadStream(fileId);

    const responseStream = new ReadableStream({
      async start(controller) {
        stream.on("data", (chunk) => controller.enqueue(chunk));
        stream.on("end", () => controller.close());
        stream.on("error", (err) => controller.error(err));
      },
    });

    return new Response(responseStream, {
      headers: {
        "Content-Type": file.contentType || "application/octet-stream",
        "Content-Disposition": `attachment; filename="${file.filename}"`,
      },
    });
  } catch (error) {
    console.error("Error downloading file:", error);
    return NextResponse.json(
      { error: "Error downloading file" },
      { status: 500 }
    );
  }
}
