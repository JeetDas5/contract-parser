import connectDB from "@/lib/db";
import Contract from "@/models/Contract";
import { NextResponse } from "next/server";

export async function GET() {
  await connectDB();

  try {
    const contracts = await Contract.find();
    return NextResponse.json(
      {
        message: "Contracts fetched successfully",
        contracts,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log("Error fetching contracts:", error);
    return NextResponse.json(
      { error: "Error fetching contracts" },
      { status: 500 }
    );
  }
}
