export default function Loading({ text = "Preparing your experience..." }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <div className="w-10 h-10 border-4 border-amber-200 border-t-primary rounded-full animate-spin" />
      <p className="text-sm text-stone-500 font-medium">{text}</p>
    </div>
  );
}
