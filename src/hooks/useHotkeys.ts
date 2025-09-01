import { useEffect, useCallback } from 'react';

export interface HotkeyAction {
  id: string;
  label: string;
  shortcut: string;
  action: () => void;
  category?: string;
}

export interface HotkeyConfig {
  actions: HotkeyAction[];
  onToggleMic?: () => void;
  onToggleTheme?: () => void;
  onNewNote?: () => void;
  onUploadPDF?: () => void;
  onGoToDashboard?: () => void;
  onSearchPDF?: () => void;
}

export const useHotkeys = (config: HotkeyConfig) => {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const { key, ctrlKey, metaKey, shiftKey, altKey } = event;
    
    // Don't trigger shortcuts when typing in input fields
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true') {
      return;
    }

    // Cmd/Ctrl + K — Command palette
    if ((ctrlKey || metaKey) && key === 'k') {
      event.preventDefault();
      // Command palette would be implemented here
      console.log('Command palette triggered');
      return;
    }

    // Cmd/Ctrl + Shift + M — Toggle mic
    if ((ctrlKey || metaKey) && shiftKey && key === 'M') {
      event.preventDefault();
      config.onToggleMic?.();
      return;
    }

    // Cmd/Ctrl + F — Search in PDF (when on document page)
    if ((ctrlKey || metaKey) && key === 'f' && !shiftKey) {
      event.preventDefault();
      config.onSearchPDF?.();
      return;
    }

    // Cmd/Ctrl + N — New Note
    if ((ctrlKey || metaKey) && key === 'n' && !shiftKey) {
      event.preventDefault();
      config.onNewNote?.();
      return;
    }

    // Cmd/Ctrl + U — Upload PDF
    if ((ctrlKey || metaKey) && key === 'u' && !shiftKey) {
      event.preventDefault();
      config.onUploadPDF?.();
      return;
    }

    // Cmd/Ctrl + D — Go to Dashboard
    if ((ctrlKey || metaKey) && key === 'd' && !shiftKey) {
      event.preventDefault();
      config.onGoToDashboard?.();
      return;
    }

    // Cmd/Ctrl + T — Toggle Theme
    if ((ctrlKey || metaKey) && key === 't' && !shiftKey) {
      event.preventDefault();
      config.onToggleTheme?.();
      return;
    }

    // ESC — Clear highlights (for PDF viewer)
    if (key === 'Escape') {
      // This will be handled by the PDF viewer component
      window.dispatchEvent(new CustomEvent('clearHighlights'));
      return;
    }

    // Custom action shortcuts
    config.actions.forEach(action => {
      const keys = action.shortcut.toLowerCase().split('+');
      const hasCtrl = keys.includes('ctrl') || keys.includes('cmd');
      const hasShift = keys.includes('shift');
      const hasAlt = keys.includes('alt');
      const keyMatch = keys.find(k => !['ctrl', 'cmd', 'shift', 'alt'].includes(k));
      
      if (
        hasCtrl === (ctrlKey || metaKey) &&
        hasShift === shiftKey &&
        hasAlt === altKey &&
        keyMatch === key.toLowerCase()
      ) {
        event.preventDefault();
        action.action();
      }
    });
  }, [config]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
};
