import mongoose from "mongoose";

declare global {
  interface Contract extends mongoose.Document {
    file_id: mongoose.Types.ObjectId;
    status: "pending" | "processing" | "completed" | "failed";
    progress: number;
    error: string | null;
    data: Record<string, any>;
    confidence_scores: Record<string, any>;
    gaps: string[];
    createdAt: Date;
    updatedAt: Date;
  }
}
