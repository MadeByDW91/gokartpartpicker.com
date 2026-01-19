'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useBuildStore } from '@/store/build-store';

interface Shortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: () => void;
  description: string;
}

/**
 * Global keyboard shortcuts handler
 */
export function useKeyboardShortcuts() {
  const router = useRouter();
  const { clearBuild, selectedEngine, selectedParts } = useBuildStore();

  useEffect(() => {
    const shortcuts: Shortcut[] = [
      {
        key: 'k',
        ctrl: true,
        action: () => {
          // Open search (Cmd+K or Ctrl+K)
          const searchInput = document.querySelector<HTMLInputElement>('input[placeholder*="Search"]');
          if (searchInput) {
            searchInput.focus();
            searchInput.select();
          }
        },
        description: 'Open search',
      },
      {
        key: 'b',
        ctrl: true,
        action: () => router.push('/builder'),
        description: 'Go to builder',
      },
      {
        key: 'e',
        ctrl: true,
        action: () => router.push('/engines'),
        description: 'Go to engines',
      },
      {
        key: 'p',
        ctrl: true,
        action: () => router.push('/parts'),
        description: 'Go to parts',
      },
      {
        key: 't',
        ctrl: true,
        action: () => router.push('/templates'),
        description: 'Go to templates',
      },
      {
        key: 's',
        ctrl: true,
        action: () => {
          // Save build or open save modal
          if (selectedEngine || selectedParts.size > 0) {
            const saveButton = document.querySelector<HTMLButtonElement>('button[aria-label*="Save"], button:has-text("Save")');
            if (saveButton) {
              saveButton.click();
            }
          }
        },
        description: 'Save build',
      },
      {
        key: 'Escape',
        action: () => {
          // Close modals or clear selections
          const modals = document.querySelectorAll('[role="dialog"], .modal');
          if (modals.length > 0) {
            const lastModal = modals[modals.length - 1];
            const closeButton = lastModal.querySelector<HTMLButtonElement>('button[aria-label="Close"], button:has-text("Close")');
            if (closeButton) {
              closeButton.click();
            }
          }
        },
        description: 'Close modal',
      },
    ];

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement ||
        (e.target as HTMLElement).isContentEditable
      ) {
        return;
      }

      shortcuts.forEach((shortcut) => {
        const ctrlMatch = shortcut.ctrl ? (e.ctrlKey || e.metaKey) : !(e.ctrlKey || e.metaKey);
        const shiftMatch = shortcut.shift ? e.shiftKey : !e.shiftKey;
        const altMatch = shortcut.alt ? e.altKey : !e.altKey;
        const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase();

        if (ctrlMatch && shiftMatch && altMatch && keyMatch) {
          e.preventDefault();
          shortcut.action();
        }
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router, clearBuild, selectedEngine, selectedParts]);
}

/**
 * Show keyboard shortcuts help modal component
 */
export function KeyboardShortcutsHelp() {
  const shortcuts = [
    { keys: ['Ctrl', 'K'], description: 'Open search' },
    { keys: ['Ctrl', 'B'], description: 'Go to builder' },
    { keys: ['Ctrl', 'E'], description: 'Go to engines' },
    { keys: ['Ctrl', 'P'], description: 'Go to parts' },
    { keys: ['Ctrl', 'T'], description: 'Go to templates' },
    { keys: ['Ctrl', 'S'], description: 'Save build' },
    { keys: ['Esc'], description: 'Close modal' },
  ];

  return (
    <div className="space-y-2">
      {shortcuts.map((shortcut, i) => (
        <div key={i} className="flex items-center justify-between">
          <span className="text-sm text-cream-400">{shortcut.description}</span>
          <div className="flex items-center gap-1">
            {shortcut.keys.map((key, j) => (
              <kbd
                key={j}
                className="px-2 py-1 text-xs font-semibold text-cream-100 bg-olive-700 border border-olive-600 rounded"
              >
                {key}
              </kbd>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
