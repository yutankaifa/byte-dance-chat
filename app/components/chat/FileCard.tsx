import { PaperclipIcon } from "lucide-react";
import { FileInfoInter } from "~/utils/fileToText";
interface Props {
  index: number;
  item: FileInfoInter;
}
export default function FileCard(props: Props) {
  return (
    <div
      className="flex gap-2 items-center p-3 rounded-2xl bg-gray-100"
      key={props.index}
    >
      <PaperclipIcon />
      <p>{props.item.name}</p>
    </div>
  );
}
