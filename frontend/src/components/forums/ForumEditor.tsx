'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Loader2, Send } from 'lucide-react';

interface ForumEditorProps {
  onSubmit: (content: string) => Promise<void>;
  onCancel?: () => void;
  initialContent?: string;
  placeholder?: string;
  submitLabel?: string;
  cancelLabel?: string;
  isEditing?: boolean;
}

export function ForumEditor({
  onSubmit,
  onCancel,
  initialContent = '',
  placeholder = 'Write your message...',
  submitLabel = 'Post',
  cancelLabel = 'Cancel',
  isEditing = false,
}: ForumEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setError('Content cannot be empty');
      return;
    }

    if (content.length < 10) {
      setError('Content must be at least 10 characters');
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      await onSubmit(content);
      setContent('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="bg-olive-800 border-olive-600">
      <CardHeader>
        <CardTitle className="text-cream-100">
          {isEditing ? 'Edit Post' : 'Write a Reply'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              setError(null);
            }}
            placeholder={placeholder}
            rows={6}
            className="bg-olive-700 border-olive-600 text-cream-100 placeholder-cream-400 focus:border-orange-500"
            disabled={submitting}
          />
          
          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}

          <div className="flex items-center justify-between">
            <p className="text-xs text-cream-400">
              {content.length} / 10,000 characters
            </p>
            <div className="flex items-center gap-2">
              {onCancel && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onCancel}
                  disabled={submitting}
                >
                  {cancelLabel}
                </Button>
              )}
              <Button
                type="submit"
                variant="primary"
                disabled={submitting || !content.trim()}
                icon={submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              >
                {submitting ? 'Submitting...' : submitLabel}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
