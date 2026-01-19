'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { 
  ChevronLeft, 
  Check, 
  X, 
  Loader2, 
  Download,
  Upload,
  AlertTriangle,
  ExternalLink
} from 'lucide-react';

interface ImageReviewItem {
  product_id: string;
  product_type: 'engine' | 'part';
  product_name: string;
  current_image_url: string | null;
  suggested_image_url: string | null;
  source: string | null;
  confidence: number;
  valid: boolean;
  http_status: number;
  validation_errors: string[];
}

export default function ImageReviewPage() {
  const router = useRouter();
  const [items, setItems] = useState<ImageReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState<Set<string>>(new Set());
  const [rejecting, setRejecting] = useState<Set<string>>(new Set());
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<'all' | 'valid' | 'invalid' | 'pending'>('all');

  // Load review items from file or API
  useEffect(() => {
    const loadReviewItems = async () => {
      // In production, this would load from an API endpoint
      // For now, we'll use a placeholder that expects a file upload
      setLoading(false);
    };

    loadReviewItems();
  }, []);

  const handleApprove = async (item: ImageReviewItem) => {
    setApproving(new Set([...approving, item.product_id]));
    
    // TODO: Call API to update database
    // For now, just remove from list
    setTimeout(() => {
      setItems(items.filter(i => i.product_id !== item.product_id));
      setApproving(new Set());
    }, 1000);
  };

  const handleReject = async (item: ImageReviewItem) => {
    setRejecting(new Set([...rejecting, item.product_id]));
    
    // Remove from list
    setTimeout(() => {
      setItems(items.filter(i => i.product_id !== item.product_id));
      setRejecting(new Set());
    }, 500);
  };

  const handleBulkApprove = async () => {
    // Approve all selected items
    const itemsToApprove = items.filter(i => selectedItems.has(i.product_id) && i.valid);
    
    for (const item of itemsToApprove) {
      await handleApprove(item);
    }
    
    setSelectedItems(new Set());
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data: ImageReviewItem[] = JSON.parse(text);
      setItems(data);
    } catch (error) {
      console.error('Error loading file:', error);
      alert('Failed to load file. Please check the format.');
    }
  };

  const filteredItems = items.filter(item => {
    if (filter === 'valid') return item.valid && item.suggested_image_url;
    if (filter === 'invalid') return !item.valid || item.validation_errors.length > 0;
    if (filter === 'pending') return !item.current_image_url && item.suggested_image_url;
    return true;
  });

  const validCount = items.filter(i => i.valid && i.suggested_image_url).length;
  const invalidCount = items.filter(i => !i.valid || i.validation_errors.length > 0).length;
  const pendingCount = items.filter(i => !i.current_image_url && i.suggested_image_url).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1 text-sm text-cream-400 hover:text-orange-400 transition-colors mb-4"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Admin
          </Link>
          <h1 className="text-display text-3xl text-cream-100">Image Review</h1>
          <p className="text-cream-300 mt-1">
            Review and approve product images before importing
          </p>
        </div>
        <div className="flex gap-2">
          <label className="cursor-pointer">
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button variant="secondary" size="sm" icon={<Upload className="w-4 h-4" />}>
              Upload JSON
            </Button>
          </label>
          {selectedItems.size > 0 && (
            <Button
              variant="primary"
              size="sm"
              onClick={handleBulkApprove}
              icon={<Check className="w-4 h-4" />}
            >
              Approve Selected ({selectedItems.size})
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="py-4">
            <div className="text-2xl font-bold text-cream-100">{items.length}</div>
            <div className="text-sm text-cream-400">Total Items</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="text-2xl font-bold text-green-400">{validCount}</div>
            <div className="text-sm text-cream-400">Valid</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="text-2xl font-bold text-red-400">{invalidCount}</div>
            <div className="text-sm text-cream-400">Invalid</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="text-2xl font-bold text-orange-400">{pendingCount}</div>
            <div className="text-sm text-cream-400">Pending</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <Button
          variant={filter === 'all' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          All ({items.length})
        </Button>
        <Button
          variant={filter === 'valid' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setFilter('valid')}
        >
          Valid ({validCount})
        </Button>
        <Button
          variant={filter === 'invalid' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setFilter('invalid')}
        >
          Invalid ({invalidCount})
        </Button>
        <Button
          variant={filter === 'pending' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setFilter('pending')}
        >
          Pending ({pendingCount})
        </Button>
      </div>

      {/* Review List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-orange-400 animate-spin" />
        </div>
      ) : filteredItems.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-cream-400">
              {items.length === 0 
                ? 'Upload a JSON file with validated images to get started'
                : 'No items match the current filter'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredItems.map((item) => (
            <Card key={item.product_id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={item.product_type === 'engine' ? 'default' : 'info'}>
                        {item.product_type}
                      </Badge>
                      {item.valid ? (
                        <Badge variant="default" className="bg-green-600">
                          <Check className="w-3 h-3 mr-1" />
                          Valid
                        </Badge>
                      ) : (
                        <Badge variant="default" className="bg-red-600">
                          <X className="w-3 h-3 mr-1" />
                          Invalid
                        </Badge>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-cream-100">{item.product_name}</h3>
                    {item.source && (
                      <p className="text-xs text-cream-400 mt-1">Source: {item.source}</p>
                    )}
                    {item.confidence > 0 && (
                      <p className="text-xs text-cream-400">
                        Confidence: {Math.round(item.confidence * 100)}%
                      </p>
                    )}
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedItems.has(item.product_id)}
                    onChange={(e) => {
                      const newSelected = new Set(selectedItems);
                      if (e.target.checked) {
                        newSelected.add(item.product_id);
                      } else {
                        newSelected.delete(item.product_id);
                      }
                      setSelectedItems(newSelected);
                    }}
                    className="w-5 h-5 rounded border-olive-600 bg-olive-800 text-orange-500 focus:ring-orange-500"
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Current Image */}
                {item.current_image_url ? (
                  <div>
                    <p className="text-xs text-cream-400 mb-2">Current Image:</p>
                    <div className="relative w-full h-32 bg-olive-800 rounded overflow-hidden border border-olive-600">
                      <Image
                        src={item.current_image_url}
                        alt="Current"
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs text-cream-400 mb-2">Current Image:</p>
                    <div className="w-full h-32 bg-olive-800 rounded border border-olive-600 flex items-center justify-center">
                      <p className="text-cream-600 text-sm">No image</p>
                    </div>
                  </div>
                )}

                {/* Suggested Image */}
                {item.suggested_image_url ? (
                  <div>
                    <p className="text-xs text-cream-400 mb-2">Suggested Image:</p>
                    <div className="relative w-full h-32 bg-olive-800 rounded overflow-hidden border border-olive-600">
                      <Image
                        src={item.suggested_image_url}
                        alt="Suggested"
                        fill
                        className="object-cover"
                        onError={(e) => {
                          // Handle broken images
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      <a
                        href={item.suggested_image_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute top-2 right-2 p-1 bg-olive-900/80 rounded hover:bg-olive-700"
                      >
                        <ExternalLink className="w-3 h-3 text-cream-400" />
                      </a>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs text-cream-400 mb-2">Suggested Image:</p>
                    <div className="w-full h-32 bg-olive-800 rounded border border-olive-600 flex items-center justify-center">
                      <p className="text-cream-600 text-sm">No suggestion</p>
                    </div>
                  </div>
                )}

                {/* Validation Errors */}
                {item.validation_errors && item.validation_errors.length > 0 && (
                  <div className="p-2 bg-red-900/20 border border-red-800/50 rounded text-xs">
                    <div className="flex items-start gap-1 text-red-400 mb-1">
                      <AlertTriangle className="w-3 h-3 mt-0.5" />
                      <span className="font-medium">Validation Errors:</span>
                    </div>
                    <ul className="list-disc list-inside text-cream-400 ml-4">
                      {item.validation_errors.map((error, idx) => (
                        <li key={idx}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t border-olive-600">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleApprove(item)}
                    disabled={!item.valid || approving.has(item.product_id) || item.suggested_image_url === null}
                    loading={approving.has(item.product_id)}
                    icon={<Check className="w-4 h-4" />}
                    className="flex-1"
                  >
                    Approve
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleReject(item)}
                    disabled={rejecting.has(item.product_id)}
                    loading={rejecting.has(item.product_id)}
                    icon={<X className="w-4 h-4" />}
                  >
                    Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
