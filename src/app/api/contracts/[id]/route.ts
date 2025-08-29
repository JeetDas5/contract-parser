import connectDB from "@/lib/db";
import Contract from "@/models/Contract";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await connectDB();
  try {
    const { id: contractId } = await params;
    const contract = await Contract.findById(contractId);
    if (!contract) {
      return NextResponse.json(
        { error: "Contract not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { message: "Contract fetched successfully", contract },
      { status: 200 }
    );
  } catch (error) {
    console.log("Error fetching contract :", error);
    return NextResponse.json(
      { error: "Error fetching contract" },
      { status: 500 }
    );
  }
}
