import { XMarkIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { asyncFileUpload } from "~/apis/data.client";
import { handleFileToBase64 } from "~/utils/file";
import { FileInfoInter } from "~/types";
interface Props {
  file: FileInfoInter;
  removeFile?: () => void;
  updateFile?: (file: FileInfoInter) => void;
}
export default function ImageCard({ file, removeFile, updateFile }: Props) {
  const [item, setItem] = useState<FileInfoInter>();
  const handleUpload = async () => {
    try {
      setItem({
        ...file,
        status: "uploading",
      });
      const base64 = await handleFileToBase64(file.file);
      const res = await asyncFileUpload(file.file);
      console.log("res", res);
      if (res.code == 0) {
        const { id } = res.data;
        const newFile: FileInfoInter = {
          ...file,
          base64,
          file_id: id,
          status: "uploaded",
        };
        setItem(newFile);
        updateFile?.(newFile);
      } else if (res.msg) {
        throw new Error(res.msg);
      } else {
        throw new Error("图片上传失败!");
      }
    } catch (error) {
      console.error("Error processing file:", error);
      toast.error((error as Error).message);
      setItem({
        ...file,
        status: "failed",
      });
    }
  };
  useEffect(() => {
    handleUpload();
  }, []);
  return (
    <div className="hover:opacity-80 rounded-xl border relative">
      {item?.status == "uploading" && <p className="p-1">Uploading...</p>}
      {item?.status == "uploaded" && (
        <img src={item?.base64} className="w-14 h-14" alt={file.name} />
      )}
      {item?.status == "failed" && <p className="text-red-500 p-1">Failed!</p>}
      {removeFile && (
        <XMarkIcon
          width={16}
          onClick={removeFile}
          className="absolute right-0 top-0 translate-y-[-50%] translate-x-1/2 hidden group-hover:block"
        />
      )}
    </div>
  );
}
