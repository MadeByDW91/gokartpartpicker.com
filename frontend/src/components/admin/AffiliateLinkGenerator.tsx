'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Copy, Check, AlertCircle, Loader2, ExternalLink } from 'lucide-react';
import {
  generateAmazonLink,
  generateeBayLink,
  generateManualAffiliateLink,
} from '@/actions/admin/affiliate';

type AffiliateProgram = 'amazon' | 'ebay' | 'manual';

export function AffiliateLinkGenerator() {
  const [program, setProgram] = useState<AffiliateProgram>('amazon');
  const [input, setInput] = useState('');
  const [manualTag, setManualTag] = useState('');
  const [affiliateLink, setAffiliateLink] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!input.trim()) {
      setError('Please enter a product URL or ID');
      return;
    }

    setLoading(true);
    setError(null);
    setAffiliateLink(null);
    setCopied(false);

    try {
      let result;

      if (program === 'amazon') {
        result = await generateAmazonLink(input);
      } else if (program === 'ebay') {
        result = await generateeBayLink(input);
      } else {
        if (!manualTag.trim()) {
          setError('Affiliate tag is required for manual links');
          setLoading(false);
          return;
        }
        result = await generateManualAffiliateLink(input, manualTag);
      }

      if (result.success && result.data) {
        setAffiliateLink(result.data.affiliateLink);
      } else if (!result.success) {
        setError('error' in result ? result.error : 'Failed to generate link');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate link');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!affiliateLink) return;

    try {
      await navigator.clipboard.writeText(affiliateLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      setError('Failed to copy to clipboard');
    }
  };

  const programOptions = [
    { value: 'amazon', label: 'Amazon' },
    { value: 'ebay', label: 'eBay' },
    { value: 'manual', label: 'Manual URL' },
  ];

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold text-cream-100">Affiliate Link Generator</h2>
        <p className="text-sm text-cream-400 mt-1">
          Generate affiliate links for Amazon, eBay, or any URL
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Program Select */}
        <Select
          label="Affiliate Program"
          value={program}
          onChange={(e) => {
            setProgram(e.target.value as AffiliateProgram);
            setAffiliateLink(null);
            setError(null);
          }}
          options={programOptions}
        />

        {/* Input Field */}
        <Input
          label={
            program === 'amazon'
              ? 'Amazon Product URL or ASIN'
              : program === 'ebay'
              ? 'eBay Item URL or Item ID'
              : 'Product URL'
          }
          placeholder={
            program === 'amazon'
              ? 'https://www.amazon.com/dp/B08XYZ... or B08XYZ1234'
              : program === 'ebay'
              ? 'https://www.ebay.com/itm/123456789 or 123456789'
              : 'https://example.com/product'
          }
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setError(null);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleGenerate();
            }
          }}
        />

        {/* Manual Tag Input */}
        {program === 'manual' && (
          <Input
            label="Affiliate Tag"
            placeholder="your-affiliate-tag"
            value={manualTag}
            onChange={(e) => {
              setManualTag(e.target.value);
              setError(null);
            }}
          />
        )}

        {/* Error Display */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-md flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Generate Button */}
        <Button
          onClick={handleGenerate}
          disabled={loading || !input.trim()}
          loading={loading}
          className="w-full"
        >
          Generate Affiliate Link
        </Button>

        {/* Generated Link */}
        {affiliateLink && (
          <div className="space-y-3 p-4 bg-green-500/10 border border-green-500/30 rounded-md">
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-cream-400 mb-1">Generated Link:</p>
                <p className="text-sm text-cream-100 break-all font-mono">
                  {affiliateLink}
                </p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={handleCopy}
                  className="p-2 bg-olive-700 border border-olive-600 rounded-md text-cream-200 hover:text-orange-400 hover:border-orange-500 transition-colors"
                  title="Copy to clipboard"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
                <a
                  href={affiliateLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-olive-700 border border-olive-600 rounded-md text-cream-200 hover:text-orange-400 hover:border-orange-500 transition-colors"
                  title="Open link"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Info */}
        <div className="p-3 bg-olive-700/30 rounded-md">
          <p className="text-xs text-cream-400">
            <strong className="text-cream-200">Amazon:</strong> Paste product URL or ASIN (10 characters)
          </p>
          <p className="text-xs text-cream-400 mt-1">
            <strong className="text-cream-200">eBay:</strong> Paste item URL or Item ID
          </p>
          <p className="text-xs text-cream-400 mt-1">
            <strong className="text-cream-200">Manual:</strong> Add your affiliate tag to any URL
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
