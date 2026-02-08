import { Loader2 } from 'lucide-react';

interface FullPageLoaderProps {
  message?: string;
  small?: boolean;
}

export function FullPageLoader({ message = 'Loading...', small = false }: FullPageLoaderProps) {
  return (
    <div className={`flex items-center justify-center ${small ? 'py-6' : 'min-h-[40vh]'} w-full`}> 
      <div className="flex flex-col items-center gap-3">
        <div className={`animate-spin rounded-full p-2 ${small ? 'w-10 h-10' : 'w-14 h-14'} border-2 border-emerald-600/40 flex items-center justify-center`}>
          <Loader2 className={`text-emerald-600 ${small ? 'w-6 h-6' : 'w-8 h-8'}`} />
        </div>
        <div className={`text-gray-600 ${small ? 'text-sm' : 'text-base'}`}>{message}</div>
      </div>
    </div>
  );
}
