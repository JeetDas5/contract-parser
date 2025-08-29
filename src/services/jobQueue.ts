import { processContract } from "../workers/processor";

export async function enqueueContractJob(contractId: string) {
  setImmediate(async () => {
    try {
      await processContract(contractId);
    } catch (err) {
      console.error("Job failed:", err);
    }
  });
}
