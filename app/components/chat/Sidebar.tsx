export default function Sidebar() {
  return (
    <div className="p-3">
      <div className="p-2 text-sm hover:bg-gray-100 cursor-pointer rounded-lg text-nowrap overflow-x-hidden text-ellipsis">
        创建新对话
      </div>
      <div className="flex flex-col gap-3">
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17].map(
          (item) => (
            <div
              key={item}
              className="p-2 text-sm hover:bg-gray-100 cursor-pointer rounded-lg text-nowrap overflow-x-hidden text-ellipsis"
            >
              Git 功能分支创建 功能分支创建功能分支创建
            </div>
          )
        )}
      </div>
    </div>
  );
}
