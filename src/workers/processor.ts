import connectDB from "@/lib/db";
import Contracts from "@/models/Contract";
import { getFileFromGridFS } from "@/services/fileService";
import { extractContractData } from "@/services/parseService";
import { calculateScoresAndGaps } from "@/services/scoreService";
import { extractTextFromPDF } from "@/utils/pdfUtil";

export async function processContract(contractId: string) {
  await connectDB();

  const contract: Contract | null = await Contracts.findById(contractId);
  if (!contract) {
    console.log("Contract not found", contractId);
    throw new Error("Contract not found");
  }

  try {
    contract.status = "processing";
    contract.progress = 10;
    await contract.save();

    const pdfBuffer = await getFileFromGridFS(contract.file_id);
    contract.progress = 30;
    await contract.save();

    const text = await extractTextFromPDF(pdfBuffer);
    contract.progress = 50;
    await contract.save();

    const parsedData = await extractContractData(text);
    contract.progress = 80;
    await contract.save();

    const { scores, gaps } = calculateScoresAndGaps(parsedData);

    contract.data = parsedData;
    contract.confidence_scores = scores;
    contract.gaps = gaps;
    contract.status = "completed";
    contract.progress = 100;
    await contract.save();
  } catch (error) {
    console.log("Error processing contract:", error);
    if (error instanceof Error) {
      contract.status = "failed";
      contract.error = error.message;
    }
    await contract.save();
  }
}
