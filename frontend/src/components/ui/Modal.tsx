import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  badge?: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  badge,
  children,
  maxWidth = 'max-w-2xl',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-[2px]">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={`relative z-10 w-full ${maxWidth} bg-[#FFFDF6] border-[3px] border-[#111111] rounded-2xl shadow-neo-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150`}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#FFFFFF] border-b-[3px] border-[#111111]">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-display font-extrabold text-[#111111] uppercase tracking-wide">
              {title}
            </h2>
            {badge && (
              <span className="px-2.5 py-0.5 font-display font-bold text-xs uppercase bg-[#D9FF55] border-[2px] border-[#111111] rounded-full">
                {badge}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 border-[2px] border-[#111111] rounded-lg bg-[#FFFFFF] hover:bg-[#FF5555] hover:text-[#FFFFFF] transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};
