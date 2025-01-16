import { useEffect } from 'react';

interface UseTaskKeyboardShortcutsProps {
  onApprove: () => void;
  onReject: () => void;
  onAIEdit: () => void;
  onManualEdit: () => void;
  onNext: () => void;
  onPrevious: () => void;
  isProcessing: boolean;
}

export const useTaskKeyboardShortcuts = ({
  onApprove,
  onReject,
  onAIEdit,
  onManualEdit,
  onNext,
  onPrevious,
  isProcessing
}: UseTaskKeyboardShortcutsProps) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // 処理中は無効
      if (isProcessing) return;

      // 入力フィールドでのショートカットは無効
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (event.key) {
        case 'Enter':
          event.preventDefault();
          onApprove();
          break;
        case 'Escape':
          event.preventDefault();
          onReject();
          break;
        case 'a':
        case 'A':
          event.preventDefault();
          onAIEdit();
          break;
        case 'e':
        case 'E':
          event.preventDefault();
          onManualEdit();
          break;
        case 'ArrowRight':
          event.preventDefault();
          onNext();
          break;
        case 'ArrowLeft':
          event.preventDefault();
          onPrevious();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    onApprove,
    onReject,
    onAIEdit,
    onManualEdit,
    onNext,
    onPrevious,
    isProcessing
  ]);
}; 