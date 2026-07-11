import { ChevronDown, Heart, Image, Send, Star, TriangleAlert, User } from 'lucide-react';

export function UserIcon({ className = 'h-4.25 w-4.25' }: { className?: string }) {
  return <User className={className} />;
}

export function ImagePlaceholderIcon({ className = 'h-5.5 w-5.5' }: { className?: string }) {
  return <Image className={className} />;
}

export function HeartIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return <Heart className={className} />;
}

export function StarIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return <Star className={className} />;
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
  return <TriangleAlert className={className} />;
}
