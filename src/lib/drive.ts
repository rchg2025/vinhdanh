import { google } from "googleapis";
import { prisma } from "./prisma";
import stream from "stream";

async function getDriveAuth() {
  const settings = await prisma.systemSetting.findMany({
    where: {
      key: {
        in: [
          "GOOGLE_DRIVE_CLIENT_EMAIL",
          "GOOGLE_DRIVE_PRIVATE_KEY",
        ],
      },
    },
  });

  const config = settings.reduce((acc, curr) => {
    acc[curr.key] = curr.value;
    return acc;
  }, {} as Record<string, string>);

  let privateKey = config.GOOGLE_DRIVE_PRIVATE_KEY || "";
  let clientEmail = config.GOOGLE_DRIVE_CLIENT_EMAIL || "";

  // Handle case where private key is a JSON string of the whole credentials file
  if (privateKey.trim().startsWith("{")) {
    try {
      const parsed = JSON.parse(privateKey);
      privateKey = parsed.private_key || privateKey;
      clientEmail = clientEmail || parsed.client_email;
    } catch (e) {
      console.warn("Failed to parse GOOGLE_DRIVE_PRIVATE_KEY as JSON");
    }
  }

  // Next.js config might escape newlines, so we replace them
  privateKey = privateKey.replace(/\\n/g, "\n");

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: clientEmail,
      private_key: privateKey,
    },
    scopes: ["https://www.googleapis.com/auth/drive"],
  });

  return google.drive({ version: "v3", auth });
}

export async function uploadToGoogleDrive(fileName: string, mimeType: string, fileBuffer: Buffer) {
  // Legacy server-side upload (might fail on Vercel for > 4.5MB)
  try {
    const drive = await getDriveAuth();
    
    const folderSetting = await prisma.systemSetting.findUnique({
      where: { key: "GOOGLE_DRIVE_FOLDER_ID" }
    });
    
    const folderId = folderSetting?.value;

    const bufferStream = new stream.PassThrough();
    bufferStream.end(fileBuffer);

    const response = await drive.files.create({
      supportsAllDrives: true,
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

    if (response.data.id) {
      await drive.permissions.create({
        fileId: response.data.id,
        supportsAllDrives: true,
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

export async function createResumableSession(fileName: string, mimeType: string, origin: string) {
  try {
    const settings = await prisma.systemSetting.findMany({
      where: {
        key: {
          in: ["GOOGLE_DRIVE_CLIENT_EMAIL", "GOOGLE_DRIVE_PRIVATE_KEY", "GOOGLE_DRIVE_FOLDER_ID"],
        },
      },
    });

    const config = settings.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {} as Record<string, string>);

    let privateKey = config.GOOGLE_DRIVE_PRIVATE_KEY || "";
    let clientEmail = config.GOOGLE_DRIVE_CLIENT_EMAIL || "";
    const folderId = config.GOOGLE_DRIVE_FOLDER_ID;

    if (privateKey.trim().startsWith("{")) {
      try {
        const parsed = JSON.parse(privateKey);
        privateKey = parsed.private_key || privateKey;
        clientEmail = clientEmail || parsed.client_email;
      } catch (err) {
        console.warn("Failed to parse private key JSON", err);
      }
    }
    privateKey = privateKey.replace(/\\n/g, "\n");

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: clientEmail,
        private_key: privateKey,
      },
      scopes: ["https://www.googleapis.com/auth/drive"],
    });

    const authClient = await auth.getClient();
    const tokenResponse = await authClient.getAccessToken();
    const token = tokenResponse.token;

    if (!token) throw new Error("Could not acquire auth token.");

    const res = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&supportsAllDrives=true", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
        "X-Upload-Content-Type": mimeType,
        "Origin": origin
      },
      body: JSON.stringify({
        name: fileName,
        parents: folderId ? [folderId] : undefined,
      })
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Google Resumable init failed: ${res.status} ${err}`);
    }

    const uploadUrl = res.headers.get("location");
    if (!uploadUrl) {
      throw new Error("No Location header returned");
    }

    return { success: true, uploadUrl };
  } catch (error) {
    console.error("Lỗi tạo Resumable Session:", error);
    return { success: false, error };
  }
}

export async function finishResumableUpload(fileId: string) {
  try {
    const drive = await getDriveAuth();
    
    await drive.permissions.create({
      fileId: fileId,
      requestBody: {
        role: "reader",
        type: "anyone",
      },
    });

    const file = await drive.files.get({
      fileId: fileId,
      fields: "id, webViewLink, webContentLink"
    });

    return {
      success: true,
      fileId: file.data.id,
      webViewLink: file.data.webViewLink,
      webContentLink: file.data.webContentLink,
    };
  } catch (error) {
    console.error("Lỗi hoàn tất upload:", error);
    return { success: false, error };
  }
}
