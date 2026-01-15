interface SkeletonProps {
  className?: string;
}

export default function Skeleton({ className }: SkeletonProps) {
  // animate-pulse: tạo hiệu ứng nhấp nháy
  // bg-gray-700: màu nền xám (phù hợp dark mode)
  return (
    <div className={`animate-pulse bg-gray-700 rounded ${className}`} />
  );
}