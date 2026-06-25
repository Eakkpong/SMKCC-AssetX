'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface SortableHeaderProps {
  label: string;
  sortKey: string;
  className?: string;
}

export default function SortableHeader({ label, sortKey, className = '' }: SortableHeaderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const currentSort = searchParams.get('sort');
  const currentDir = searchParams.get('dir') || 'asc';
  
  const isActive = currentSort === sortKey;
  
  const toggleSort = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', sortKey);
    
    if (isActive) {
      params.set('dir', currentDir === 'asc' ? 'desc' : 'asc');
    } else {
      params.set('dir', 'asc');
    }
    
    router.push(`?${params.toString()}`, { scroll: false });
  };
  
  return (
    <th 
      className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-200 select-none transition-colors ${className}`}
      onClick={toggleSort}
    >
      <div className="flex items-center space-x-1">
        <span>{label}</span>
        {isActive ? (
           currentDir === 'asc' ? <ChevronUp size={14} className="text-blue-600" /> : <ChevronDown size={14} className="text-blue-600" />
        ) : (
           <ChevronUp size={14} className="text-gray-300 opacity-0 group-hover:opacity-100" />
        )}
      </div>
    </th>
  );
}
