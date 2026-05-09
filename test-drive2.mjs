import { PrismaClient } from '@prisma/client';
import { google } from 'googleapis';
import stream from 'stream';

const prisma = new PrismaClient();

async function test() {
  try {
    const settings = await prisma.systemSetting.findMany();
    const config = settings.reduce((acc, curr) => { acc[curr.key] = curr.value; return acc; }, {});
    let privateKey = config.GOOGLE_DRIVE_PRIVATE_KEY || "";
    let clientEmail = config.GOOGLE_DRIVE_CLIENT_EMAIL || "";
    const folderId = config.GOOGLE_DRIVE_FOLDER_ID;

    if (privateKey.trim().startsWith("{")) {
      const parsed = JSON.parse(privateKey);
      privateKey = parsed.private_key || privateKey;
      clientEmail = clientEmail || parsed.client_email;
    }
    privateKey = privateKey.replace(/\\n/g, "\n");

    const auth = new google.auth.GoogleAuth({
      credentials: { client_email: clientEmail, private_key: privateKey },
      scopes: ["https://www.googleapis.com/auth/drive"],
    });

    const drive = google.drive({ version: "v3", auth });
    
    // Add supportsAllDrives just in case it's a team drive
    const response = await drive.files.create({
      supportsAllDrives: true,
      requestBody: {
        name: "test-file-supportsAllDrives.txt",
        parents: folderId ? [folderId] : undefined,
      },
      media: {
        mimeType: "text/plain",
        body: stream.Readable.from(["Hello world team drive!"]),
      },
      fields: "id",
    });

    console.log("Upload Success! ID:", response.data.id);
  } catch (error) {
    console.error("UPLOAD ERROR DETAILS:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}
test();