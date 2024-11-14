import * as PDFJS from "pdfjs-dist/legacy/build/pdf.mjs";
import * as PdfWorker from "pdfjs-dist/build/pdf.worker.mjs";
window.pdfjsWorker = PdfWorker;

const readPDFPage = async (doc: unknown, pageNo: unknown) => {
  const page = await doc.getPage(pageNo);
  const tokenizedText = await page.getTextContent();
  const pageText = tokenizedText.items
    .map((token: unknown) => token.str)
    .join("");
  return pageText.replaceAll(/\s+/g, " ");
};

const readPDFDoc = async (url: string) => {
  const doc = await PDFJS.getDocument(url).promise;
  return new Promise<string>((resolve, reject) => {
    try {
      const pageTextPromises: Promise<string>[] = [];
      for (let pageNo = 1; pageNo <= doc.numPages; pageNo++) {
        pageTextPromises.push(readPDFPage(doc, pageNo));
      }
      Promise.all(pageTextPromises)
        .then((pageTexts) => {
          resolve(pageTexts.join(""));
        })
        .catch((err) => {
          reject(err);
        });
    } catch (err) {
      reject(err);
    }
  });
};

export const getPDFTextClient = async (url: string) => {
  return await readPDFDoc(url);
};
