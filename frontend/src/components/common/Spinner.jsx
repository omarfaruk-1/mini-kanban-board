export default function Spinner({ size = "md" }) {
  const sizes = {
    sm: "h-4 w-4 border-2",
    md: "h-6 w-6 border-2",
    lg: "h-9 w-9 border-[3px]",
  };
  return (
    <span
      className={`inline-block animate-spin rounded-full border-slate-200 border-t-indigo-600 ${sizes[size]}`}
      aria-label="Loading"
    />
  );
}
