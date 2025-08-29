import connectDB from "@/lib/db";
import Contract from "@/models/Contract";
import { getGridFSBucket } from "@/services/fileService";
import { enqueueContractJob } from "@/services/jobQueue";
import busboy from "busboy";
import { NextRequest, NextResponse } from "next/server";

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(request: NextRequest, response: NextResponse) {
  await connectDB();

  try {
    const bb = busboy({
      headers: Object.fromEntries(request.headers),
    });

    const uploadPromise = new Promise<{ contract_id: string; contract: any }>(
      (resolve, reject) => {
        bb.on("file", async (_fieldname: string, file: any, info: any) => {
          const { filename, mimeType } = info;

          if (mimeType !== "application/pdf") {
            reject(new Error("Invalid file type"));
            return;
          }

          const bucket = await getGridFSBucket();
          const uploadStream = bucket.openUploadStream(filename, {
            contentType: mimeType,
          });
          file.pipe(uploadStream);

          uploadStream.on("finish", async () => {
            try {
              const contract = await Contract.create({
                file_id: uploadStream.id,
                status: "pending",
                progress: 0,
              });
              const contractId = contract._id.toString();
              enqueueContractJob(contractId);
              resolve({ contract_id: contractId, contract });
            } catch (error) {
              reject(error);
            }
          });

          uploadStream.on("error", (error) => {
            console.error("GridFS Upload Error:", error);
            reject(error);
          });
        });

        bb.on("error", (error) => {
          reject(error);
        });

        request.body
          ?.pipeTo(
            new WritableStream({
              write(chunk) {
                bb.write(chunk);
              },
              close() {
                bb.end();
              },
            })
          )
          .catch(reject);
      }
    );

    const result = await uploadPromise;

    return NextResponse.json({
      message: "File uploaded successfully",
      contract_id: result.contract_id,
      contract: result.contract,
    });
  } catch (error) {
    console.error("File Upload Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
