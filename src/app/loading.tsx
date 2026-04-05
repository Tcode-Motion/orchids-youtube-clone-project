import { Loader2 } from 'lucide-react';

export default function GlobalLoading() {
  return (
    <div className="pt-24 px-8 md:pl-72 w-full min-h-[80vh] flex flex-col items-center justify-center">
      <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
      <p className="text-white/40 text-sm font-semibold tracking-wider uppercase animate-pulse">Loading Content...</p>
    </div>
  );
}
