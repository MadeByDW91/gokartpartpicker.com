'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { X, Command } from 'lucide-react';
import { KeyboardShortcutsHelp } from '@/hooks/use-keyboard-shortcuts';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ShortcutsModal({ isOpen, onClose }: ShortcutsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-olive-900/80 backdrop-blur-sm" onClick={onClose} />
      <Card className="relative w-full max-w-lg">
        <CardHeader className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Command className="w-5 h-5 text-orange-400" />
            <h2 className="text-display text-xl text-cream-100">Keyboard Shortcuts</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} icon={<X className="w-4 h-4" />} />
        </CardHeader>
        <CardContent>
          <KeyboardShortcutsHelp />
        </CardContent>
      </Card>
    </div>
  );
}
