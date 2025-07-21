export default function Loading() {
  return (
    // Overlay เต็มจอ, พื้นหลังสีดำโปร่งแสง, คลิกไม่ได้
    <div className="fixed inset-0 bg-black/50 bg-opacity-20 flex items-center justify-center z-50 pointer-events-none">
      <div className="flex items-center justify-center p-4 rounded-lg">
        {" "}
        <div className="size-10 border-4 border-gray-400 border-r-gray-900 animate-spin rounded-full"></div>
        <span className="ml-2 text-white"> Loading... </span>{" "}
      </div>
    </div>
  );
}
