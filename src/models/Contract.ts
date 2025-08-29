import mongoose from "mongoose";

const ContractSchema = new mongoose.Schema({
  file_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "processing", "completed", "failed"],
    default: "pending",
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },
  error: {
    type: String,
    default: null,
  },
  data: {
    type: Object,
    default: {},
  },
  confidence_scores: {
    type: Object,
    default: {},
  },
  gaps: {
    type: [String],
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Contracts ||
  mongoose.model<Contract>("Contracts", ContractSchema);
