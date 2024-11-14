import mammoth from "mammoth";
import { getPDFTextClient } from "~/utils/getPDFText.client";
import { ChangeEvent } from "react";

export const allowFileList = [
  ".pdf",
  ".docx",
  ".html",
  ".txt",
  ".md",
  ".csv",
  ".json",
];
export interface FileInfoInter {
  text: string;
  name: string;
}
export const getFileExtension = (filename: string): string => {
  const lastIndex = filename.lastIndexOf(".");
  if (lastIndex !== -1) return filename.slice(lastIndex);
  return "";
};
export const FileToText = async (e: ChangeEvent<HTMLInputElement>) => {
  let selectedFile;
  if (e.target.files) selectedFile = e.target.files[0];
  if (selectedFile) {
    const fileName = selectedFile.name;
    const fileExtension = getFileExtension(fileName);
    if (!allowFileList.includes(fileExtension)) {
      // toast.error('The file format is not supported')
    } else {
      return await handleFileExtractText(fileExtension, selectedFile);
    }
  }
};
export const handleFileExtractText = async (
  fileExtension: string,
  file: File
): Promise<FileInfoInter> => {
  const fileInfo: FileInfoInter = { name: "", text: "" };
  fileInfo.name = file.name;

  const readAsText = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        resolve(result.trim());
      };
      reader.readAsText(file);
    });
  };

  const readAsArrayBuffer = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const arrayBuffer = event.target?.result as ArrayBuffer;
        resolve(arrayBuffer);
      };
      reader.readAsArrayBuffer(file);
    });
  };

  if ([".txt", ".html", ".json", ".md", ".csv"].includes(fileExtension)) {
    fileInfo.text = await readAsText(file);
  } else if (fileExtension === ".docx") {
    const arrayBuffer = await readAsArrayBuffer(file);
    const result = await mammoth.extractRawText({
      arrayBuffer: new Uint8Array(arrayBuffer),
    });
    fileInfo.text = result.value.trim();
    console.log(fileInfo);
  } else if (fileExtension === ".pdf") {
    const pdfUrl = URL.createObjectURL(file);
    const pdfText = await getPDFTextClient(pdfUrl);
    fileInfo.text = pdfText.trim();
  }
  return fileInfo;
};
