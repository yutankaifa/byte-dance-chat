import { DocumentTextIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { asyncFileUpload } from "~/apis/data";
import { FileInfoInter } from "~/types";
interface Props {
  index: number;
  file: FileInfoInter;
  removeFile: (index: number) => void;
}
export default function FileCard({ index, file, removeFile }: Props) {
  const [item, setItem] = useState<FileInfoInter>();
  const handleUpload = async () => {
    try {
      setItem({
        ...file,
        status: "uploading",
      });
      const res = await asyncFileUpload(file.file);
      console.log("res", res);
      if (res.code == 0) {
        const { id } = res.data;
        setItem({
          ...file,
          file_id: id,
          status: "uploaded",
        });
      } else if (res.msg) {
        throw new Error(res.msg);
      } else throw new Error("文件上传失败!");
    } catch (error) {
      toast.error((error as Error).message);
      setItem({
        ...file,
        status: "failed",
      });
      console.error("Error processing file:", error);
    }
  };
  useEffect(() => {
    console.log("item", item);
    handleUpload();
  }, []);
  return (
    <div className="relative" key={index}>
      <div
        className="flex gap-2 items-center p-3 rounded-2xl bg-gray-100"
        key={index}
      >
        <DocumentTextIcon width={22} />
        <div className="flex flex-col gap-1">
          <p>{item?.name}</p>
          {item?.status == "uploading" && <p className="p-1">Uploading...</p>}
          {item?.status == "uploaded" && (
            <p className="text-green-500 p-1">Uploaded!</p>
          )}
          {item?.status == "failed" && (
            <p className="text-red-500 p-1">Failed!</p>
          )}
        </div>
      </div>
      <XMarkIcon
        width={16}
        onClick={() => removeFile(index)}
        className="absolute right-0 top-0 translate-y-[-50%] translate-x-1/2 hidden group-hover:block"
      />
    </div>
  );
}
