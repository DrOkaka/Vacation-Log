import React from 'react';
import { X } from 'lucide-react';

interface LightboxModalProps {
  isOpen: boolean;
  imageUrl: string;
  caption: string;
  onClose: () => void;
}

export const LightboxModal: React.FC<LightboxModalProps> = ({
  isOpen,
  imageUrl,
  caption,
  onClose,
}) => {
  if (!isOpen || !imageUrl) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-4"
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2.5 rounded-full bg-slate-800 text-white hover:bg-slate-700 transition"
      >
        <X className="w-5 h-5" />
      </button>

      <img
        src={imageUrl}
        alt={caption || 'Vollbild'}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[80vh] max-w-full rounded-2xl object-contain shadow-2xl"
      />

      {caption && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="mt-4 text-center max-w-md px-4 py-2 rounded-xl bg-slate-900/80 border border-white/10"
        >
          <p className="text-sm font-medium text-white">{caption}</p>
        </div>
      )}
    </div>
  );
};
