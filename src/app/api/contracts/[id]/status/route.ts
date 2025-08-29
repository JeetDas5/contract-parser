import { NextRequest, NextResponse } from "next/server";
import Contract from "@/models/Contract";
import connectDB from "@/lib/db";

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
      {
        message: "Contract status fetched successfully",
        status: contract.status,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
