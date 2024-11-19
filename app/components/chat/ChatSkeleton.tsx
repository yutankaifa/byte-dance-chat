import { Skeleton } from "~/components/ui/skeleton";

export const MdSkeleton = () => {
  return (
    <div>
      <Skeleton className="w-3/4 h-[300px] rounded-3xl" />
    </div>
  );
};

export const SuggestionSkeleton = () => {
  return (
    <div className="flex flex-col gap-2 mt-3">
      <Skeleton className="w-[150px] h-[20px] rounded-xl" />
      <Skeleton className="w-[150px] h-[20px] rounded-xl" />
      <Skeleton className="w-[150px] h-[20px] rounded-xl" />
    </div>
  );
};
