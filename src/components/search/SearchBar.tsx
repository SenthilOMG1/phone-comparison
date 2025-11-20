import { Search, X } from 'lucide-react';
import { InputHTMLAttributes } from 'react';

interface SearchBarProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  onClear?: () => void;
  showClear?: boolean;
}

export function SearchBar({ value, onChange, onClear, showClear, className = '', ...props }: SearchBarProps) {
  return (
    <div className={`relative w-full ${className}`}>
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400">
        <Search className="w-5 h-5" />
      </div>

      <input
        type="text"
        value={value}
        onChange={onChange}
        className="w-full pl-12 pr-12 py-4 text-lg bg-white border-2 border-neutral-200 rounded-xl focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100 transition-all"
        {...props}
      />

      {showClear && value && (
        <button
          onClick={onClear}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
          type="button"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
