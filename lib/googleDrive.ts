import path from "path";
import { google } from "googleapis";

type DriveFolderResponse = {
  id?: string;
  name?: string;
  webViewLink?: string;
};

type DriveFileListResponse = {
  files?: {
    id?: string;
    name?: string;
    thumbnailLink?: string;
    webViewLink?: string;
    mimeType?: string;
  }[];
};

export async function createDriveFolder(folderName: string) {
  const keyFileName = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE;
  const parentFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

  if (!keyFileName) {
    throw new Error("GOOGLE_SERVICE_ACCOUNT_KEY_FILE がありません");
  }

  if (!parentFolderId) {
    throw new Error("GOOGLE_DRIVE_FOLDER_ID がありません");
  }

  const keyFilePath = path.resolve(process.cwd(), keyFileName);

  const googleAuth = new google.auth.GoogleAuth({
    keyFile: keyFilePath,
    scopes: ["https://www.googleapis.com/auth/drive"],
  });

  const authClient = await googleAuth.getClient();

 const response = (await authClient.request({
    url: "https://www.googleapis.com/drive/v3/files",
    method: "POST",
    params: {
      fields: "id,name,webViewLink",
    },
    data: {
      name: folderName,
      mimeType: "application/vnd.google-apps.folder",
      parents: [parentFolderId],
    },
  }));

  return response.data;
}

export async function listDriveFiles(folderId: string) {
  const keyFileName = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE;

  if (!keyFileName) {
    throw new Error("GOOGLE_SERVICE_ACCOUNT_KEY_FILE がありません");
  }

  const keyFilePath = path.resolve(process.cwd(), keyFileName);

  const googleAuth = new google.auth.GoogleAuth({
    keyFile: keyFilePath,
    scopes: ["https://www.googleapis.com/auth/drive"],
  });

  const authClient = await googleAuth.getClient();

  const response = await authClient.request({
    url: "https://www.googleapis.com/drive/v3/files",
    method: "GET",
    params: {
      q: `'${folderId}' in parents and trashed=false`,
      fields: "files(id,name,thumbnailLink,webViewLink,mimeType)",
    },
  });

  return response.data as DriveFileListResponse;
}