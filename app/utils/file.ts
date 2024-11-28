export const allowFileList = [
  ".pdf",
  ".doc",
  ".docx",
  ".csv",
  ".json",
  ".xls",
  ".xlsx",
  ".ppt",
  ".pptx",
];
export const allowImageList = [
  ".jpg",
  ".jpg2",
  ".png",
  ".gif",
  ".webp",
  "heic",
  "heif",
  ".bmp",
  ".pcd",
  ".tiff",
];

export const handleFileToBase64 = async (file: File) => {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onloadend = () => {
      if (reader.result) {
        resolve(reader.result as string);
      } else {
        reject(new Error("Failed to convert file to base64"));
      }
    };

    reader.onerror = () => reject(new Error("File reading error"));

    reader.readAsDataURL(file);
  });
};
