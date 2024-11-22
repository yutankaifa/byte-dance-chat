import { DocumentTextIcon } from "@heroicons/react/24/outline";
import { FileInfoInter } from "~/types";
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
      <DocumentTextIcon width={22} />
      <p>{props.item.name}</p>
    </div>
  );
}
