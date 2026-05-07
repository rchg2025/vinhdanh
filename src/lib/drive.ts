import { google } from "googleapis";
import { prisma } from "./prisma";
import stream from "stream";

async function getDriveAuth() {
  const settings = await prisma.systemSetting.findMany({
    where: {
      key: {
        in: [
          "GOOGLE_DRIVE_CLIENT_ID",
          "GOOGLE_DRIVE_CLIENT_SECRET",
          "GOOGLE_DRIVE_REFRESH_TOKEN",
        ],
      },
    },
  });

  const config = settings.reduce((acc, curr) => {
    acc[curr.key] = curr.value;
    return acc;
  }, {} as Record<string, string>);

  const oauth2Client = new google.auth.OAuth2(
    config.GOOGLE_DRIVE_CLIENT_ID,
    config.GOOGLE_DRIVE_CLIENT_SECRET,
    "https://developers.google.com/oauthplayground"
  );

  oauth2Client.setCredentials({
    refresh_token: config.GOOGLE_DRIVE_REFRESH_TOKEN,
  });

  return google.drive({ version: "v3", auth: oauth2Client });
}

export async function uploadToGoogleDrive(fileName: string, mimeType: string, fileBuffer: Buffer) {
  try {
    const drive = await getDriveAuth();
    
    const folderSetting = await prisma.systemSetting.findUnique({
      where: { key: "GOOGLE_DRIVE_FOLDER_ID" }
    });
    
    const folderId = folderSetting?.value;

    const bufferStream = new stream.PassThrough();
    bufferStream.end(fileBuffer);

    const response = await drive.files.create({
      requestBody: {
        name: fileName,
        parents: folderId ? [folderId] : undefined,
      },
      media: {
        mimeType: mimeType,
        body: bufferStream,
      },
      fields: "id, webViewLink, webContentLink",
    });

    // Cấp quyền công khai cho file để hệ thống đọc được (hoặc làm file minh chứng)
    if (response.data.id) {
      await drive.permissions.create({
        fileId: response.data.id,
        requestBody: {
          role: "reader",
          type: "anyone",
        },
      });
    }

    return {
      success: true,
      fileId: response.data.id,
      webViewLink: response.data.webViewLink,
      webContentLink: response.data.webContentLink,
    };
  } catch (error) {
    console.error("Lỗi upload Google Drive:", error);
    return { success: false, error };
  }
}
