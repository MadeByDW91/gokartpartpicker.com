'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { DataTable, TableActions } from '@/components/admin/DataTable';
import { ChevronLeft, FileText, Copy, AlertCircle, CheckCircle2, Loader2, Wand2 } from 'lucide-react';
import {
  findDuplicates,
  generateDescription,
  validateImageUrl,
} from '@/actions/admin/content';

interface DuplicateCandidate {
  id: string;
  name: string;
  type: 'engine' | 'part';
  slug: string;
  brand: string | null;
  similarityScore: number;
}

export default function ContentAutomationPage() {
  const router = useRouter();
  const [duplicates, setDuplicates] = useState<DuplicateCandidate[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatedDescription, setGeneratedDescription] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [imageValidation, setImageValidation] = useState<{ valid: boolean; error?: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDuplicates();
  }, []);

  const fetchDuplicates = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await findDuplicates();
      
      if (result.success && result.data) {
        setDuplicates(result.data);
      } else if (!result.success) {
        setError('error' in result ? result.error : 'Failed to find duplicates');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to find duplicates');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateDescription = async () => {
    // This is a demo - in production, you'd select an item first
    setGenerating(true);
    setError(null);
    setGeneratedDescription(null);

    try {
      // Example: generate for a generic engine
      const result = await generateDescription('engine', '', {
        brand: 'Predator',
        displacement_cc: 212,
        horsepower: 6.5,
        shaft_diameter: 0.75,
        variant: 'Hemi',
      });

      if (result.success && result.data) {
        setGeneratedDescription(result.data.description);
      } else if (!result.success) {
        setError('error' in result ? result.error : 'Failed to generate description');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate description');
    } finally {
      setGenerating(false);
    }
  };

  const handleValidateImage = async () => {
    if (!imageUrl.trim()) {
      setImageValidation({ valid: false, error: 'URL is required' });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await validateImageUrl(imageUrl);
      
      if (result.success && result.data) {
        setImageValidation(result.data);
      } else if (!result.success) {
        setError('error' in result ? result.error : 'Validation failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Validation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyDescription = async () => {
    if (!generatedDescription) return;
    
    try {
      await navigator.clipboard.writeText(generatedDescription);
      alert('Description copied to clipboard!');
    } catch (err) {
      setError('Failed to copy to clipboard');
    }
  };

  const duplicateColumns = [
    {
      key: 'name',
      header: 'Item',
      render: (item: DuplicateCandidate) => (
        <div>
          <p className="font-medium text-cream-100">{item.name}</p>
          <p className="text-xs text-cream-400">{item.slug}</p>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      render: (item: DuplicateCandidate) => (
        <Badge variant="info" size="sm">
          {item.type}
        </Badge>
      ),
    },
    {
      key: 'brand',
      header: 'Brand',
      render: (item: DuplicateCandidate) => (
        <span className="text-cream-300">{item.brand || '—'}</span>
      ),
    },
    {
      key: 'similarityScore',
      header: 'Similarity',
      render: (item: DuplicateCandidate) => (
        <Badge variant={item.similarityScore > 0.9 ? 'warning' : 'default'} size="sm">
          {Math.round(item.similarityScore * 100)}%
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'w-24',
      render: (item: DuplicateCandidate) => (
        <TableActions>
          <Link href={item.type === 'engine' ? `/admin/engines/${item.id}` : `/admin/parts/${item.id}`}>
            <button 
              className="p-2 text-cream-400 hover:text-orange-400 hover:bg-olive-600 rounded transition-colors"
              title="Review"
            >
              <AlertCircle className="w-4 h-4" />
            </button>
          </Link>
        </TableActions>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1 text-sm text-cream-400 hover:text-orange-400 transition-colors mb-4"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <Wand2 className="w-8 h-8 text-orange-400" />
            <div>
              <h1 className="text-display text-3xl text-cream-100">Content Automation</h1>
              <p className="text-cream-300 mt-1">
                Auto-generate descriptions, detect duplicates, and validate content
              </p>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <Card className="border-red-500/30 bg-red-500/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Description Generator */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-400" />
              <h2 className="text-lg font-semibold text-cream-100">Description Generator</h2>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-cream-400">
              Generate product descriptions from specifications using templates.
            </p>
            
            <Button
              onClick={handleGenerateDescription}
              disabled={generating}
              loading={generating}
              variant="secondary"
              className="w-full"
            >
              Generate Sample Description
            </Button>

            {generatedDescription && (
              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-md space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-green-400">Generated Description</p>
                  <button
                    onClick={handleCopyDescription}
                    className="p-1.5 text-green-400 hover:text-green-300 hover:bg-green-500/20 rounded transition-colors"
                    title="Copy to clipboard"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-sm text-cream-200">{generatedDescription}</p>
              </div>
            )}

            <div className="p-3 bg-olive-700/30 rounded-md">
              <p className="text-xs text-cream-400">
                In production, select an item from the catalog to generate a description based on its specifications.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Image URL Validator */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
              <h2 className="text-lg font-semibold text-cream-100">Image URL Validator</h2>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Image URL"
              placeholder="https://example.com/image.jpg"
              value={imageUrl}
              onChange={(e) => {
                setImageUrl(e.target.value);
                setImageValidation(null);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleValidateImage();
                }
              }}
            />
            
            <Button
              onClick={handleValidateImage}
              disabled={loading || !imageUrl.trim()}
              loading={loading}
              variant="secondary"
              className="w-full"
            >
              Validate URL
            </Button>

            {imageValidation && (
              <div className={`p-4 rounded-md border ${
                imageValidation.valid
                  ? 'bg-green-500/10 border-green-500/30'
                  : 'bg-red-500/10 border-red-500/30'
              }`}>
                <div className="flex items-center gap-2">
                  {imageValidation.valid ? (
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-400" />
                  )}
                  <p className={`text-sm font-medium ${
                    imageValidation.valid ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {imageValidation.valid ? 'Valid Image URL' : 'Invalid URL'}
                  </p>
                </div>
                {imageValidation.error && (
                  <p className="text-xs text-cream-400 mt-2">{imageValidation.error}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Duplicate Detection */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-cream-100">Potential Duplicates</h2>
            <p className="text-sm text-cream-400 mt-1">
              {loading ? 'Scanning...' : `${duplicates.length} potential duplicates found`}
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={fetchDuplicates}
            disabled={loading}
            loading={loading}
          >
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={duplicateColumns}
            data={duplicates}
            loading={loading}
            emptyMessage="No duplicates found. Great job!"
            keyExtractor={(item) => item.id}
          />
        </CardContent>
      </Card>

      {/* Info */}
      <Card className="bg-olive-700/30 border-olive-600">
        <CardContent className="p-4">
          <h3 className="text-sm font-semibold text-cream-100 mb-2">Content Automation Features</h3>
          <ul className="text-xs text-cream-400 space-y-1 list-disc list-inside">
            <li>Description generation from specifications (template-based)</li>
            <li>Duplicate detection using name similarity</li>
            <li>Image URL validation</li>
            <li>Future: AI-assisted content generation (OpenAI integration)</li>
            <li>Future: Automated image sourcing and validation</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
