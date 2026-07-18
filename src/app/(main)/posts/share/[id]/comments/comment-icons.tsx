import { ChevronDown, Heart, Image, ImageOff, Send, User } from 'lucide-react';

export function UserIcon({ className = 'h-4.25 w-4.25' }: { className?: string }) {
  return <User className={className} />;
}

// Loading fallback — shown while an attached image hasn't finished loading yet.
export function ImagePlaceholderIcon({ className = 'h-5.5 w-5.5' }: { className?: string }) {
  return <Image className={className} />;
}

// Error fallback — shown once an attached image's load has failed (expired
// SAS URL, network error, etc.), distinct from the loading state above.
export function ImageOffIcon({ className = 'h-5.5 w-5.5' }: { className?: string }) {
  return <ImageOff className={className} />;
}

export function HeartIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return <Heart className={className} />;
}

export function ChevronDownIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return <ChevronDown className={className} />;
}

export function SendIcon({ className = 'h-3.5 w-3.5' }: { className?: string }) {
  return <Send className={className} />;
}

export function ReplyIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
      className={className}
    >
      <path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.4 8.6 8.6 0 0 1-4-1L3 20l1.1-4a8.4 8.4 0 0 1-1-4A8.38 8.38 0 0 1 11.5 3a8.4 8.4 0 0 1 9.5 8.5Z" />
    </svg>
  );
}

export function AlertTriangleIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
      className={className}
    >
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}
