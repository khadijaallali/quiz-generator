export default function LoadingSpinner({ label = "Chargement..." }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
      {label && <p className="text-sm text-zinc-600">{label}</p>}
    </div>
  );
}
