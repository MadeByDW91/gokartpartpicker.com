'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { ChevronLeft, Key, CheckCircle2, XCircle, Settings, Loader2 } from 'lucide-react';
import {
  getApiKeys,
  generateApiKey,
  revokeApiKey,
  getIntegrationStatus,
} from '@/actions/admin/api';

interface ApiKey {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  lastUsed: string | null;
  usageCount: number;
}

interface IntegrationStatus {
  amazon: { enabled: boolean; configured: boolean };
  ebay: { enabled: boolean; configured: boolean };
  googleAnalytics: { enabled: boolean; configured: boolean };
}

export default function ApiManagementPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [integrations, setIntegrations] = useState<IntegrationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKey, setNewKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [keysResult, integrationsResult] = await Promise.all([
        getApiKeys(),
        getIntegrationStatus(),
      ]);

      if (keysResult.success && keysResult.data) {
        setApiKeys(keysResult.data);
      }

      if (integrationsResult.success && integrationsResult.data) {
        setIntegrations(integrationsResult.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load API data');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateKey = async () => {
    if (!newKeyName.trim()) {
      alert('Please enter a name for the API key');
      return;
    }

    setGenerating(true);
    setError(null);

    try {
      const result = await generateApiKey(newKeyName);
      
      if (result.success && result.data) {
        setNewKey(result.data.key);
        setNewKeyName('');
        await fetchData();
      } else if (!result.success) {
        setError('error' in result ? result.error : 'Failed to generate API key');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate API key');
    } finally {
      setGenerating(false);
    }
  };

  const handleCopyKey = async (key: string) => {
    try {
      await navigator.clipboard.writeText(key);
      alert('API key copied to clipboard!');
    } catch (err) {
      setError('Failed to copy to clipboard');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-orange-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-1 text-sm text-cream-400 hover:text-orange-400 transition-colors mb-4"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
        <div className="flex items-center gap-3">
          <Key className="w-8 h-8 text-orange-400" />
          <div>
            <h1 className="text-display text-3xl text-cream-100">API Management</h1>
            <p className="text-cream-300 mt-1">
              Manage API keys and third-party integrations
            </p>
          </div>
        </div>
      </div>

      {error && (
        <Card className="border-red-500/30 bg-red-500/10">
          <CardContent className="p-4">
            <p className="text-sm text-red-400">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* New API Key Generation */}
      {newKey && (
        <Card className="border-green-500/30 bg-green-500/10">
          <CardHeader>
            <h2 className="text-lg font-semibold text-green-400">API Key Generated</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-cream-400">
              Save this key now - you won't be able to see it again!
            </p>
            <div className="flex items-center gap-3 p-4 bg-olive-800 rounded-md">
              <code className="flex-1 text-sm text-cream-100 font-mono break-all">{newKey}</code>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleCopyKey(newKey)}
              >
                Copy
              </Button>
            </div>
            <Button
              variant="secondary"
              onClick={() => setNewKey(null)}
              className="w-full"
            >
              Done
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Generate New Key */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-cream-100">Generate API Key</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Key Name"
            placeholder="e.g., Production API Key"
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleGenerateKey();
              }
            }}
          />
          <Button
            onClick={handleGenerateKey}
            disabled={generating || !newKeyName.trim()}
            loading={generating}
            className="w-full"
          >
            Generate API Key
          </Button>
        </CardContent>
      </Card>

      {/* API Keys List */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-cream-100">API Keys</h2>
          <p className="text-sm text-cream-400 mt-1">
            {apiKeys.length} active key{apiKeys.length !== 1 ? 's' : ''}
          </p>
        </CardHeader>
        <CardContent>
          {apiKeys.length === 0 ? (
            <p className="text-cream-400 text-center py-8">No API keys created yet</p>
          ) : (
            <div className="space-y-3">
              {apiKeys.map((key) => (
                <div
                  key={key.id}
                  className="flex items-center justify-between p-4 bg-olive-700/50 rounded-md"
                >
                  <div className="flex-1">
                    <p className="font-medium text-cream-100">{key.name}</p>
                    <p className="text-xs text-cream-400 mt-1">
                      Created: {new Date(key.createdAt).toLocaleDateString()}
                      {key.lastUsed && ` • Last used: ${new Date(key.lastUsed).toLocaleDateString()}`}
                      {` • Used ${key.usageCount} times`}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => revokeApiKey(key.id)}
                  >
                    Revoke
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Integrations */}
      {integrations && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-orange-400" />
              <h2 className="text-lg font-semibold text-cream-100">Third-Party Integrations</h2>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Amazon */}
            <div className="flex items-center justify-between p-4 bg-olive-700/50 rounded-md">
              <div className="flex items-center gap-3">
                {integrations.amazon.configured ? (
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-400" />
                )}
                <div>
                  <p className="font-medium text-cream-100">Amazon Associates</p>
                  <p className="text-xs text-cream-400">
                    {integrations.amazon.configured ? 'Configured' : 'Not configured'}
                  </p>
                </div>
              </div>
              <Badge variant={integrations.amazon.configured ? 'success' : 'error'} size="sm">
                {integrations.amazon.configured ? 'Active' : 'Inactive'}
              </Badge>
            </div>

            {/* eBay */}
            <div className="flex items-center justify-between p-4 bg-olive-700/50 rounded-md">
              <div className="flex items-center gap-3">
                {integrations.ebay.configured ? (
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-400" />
                )}
                <div>
                  <p className="font-medium text-cream-100">eBay Partner Network</p>
                  <p className="text-xs text-cream-400">
                    {integrations.ebay.configured ? 'Configured' : 'Not configured'}
                  </p>
                </div>
              </div>
              <Badge variant={integrations.ebay.configured ? 'success' : 'error'} size="sm">
                {integrations.ebay.configured ? 'Active' : 'Inactive'}
              </Badge>
            </div>

            {/* Google Analytics */}
            <div className="flex items-center justify-between p-4 bg-olive-700/50 rounded-md">
              <div className="flex items-center gap-3">
                {integrations.googleAnalytics.configured ? (
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-400" />
                )}
                <div>
                  <p className="font-medium text-cream-100">Google Analytics</p>
                  <p className="text-xs text-cream-400">
                    {integrations.googleAnalytics.configured ? 'Configured' : 'Not configured'}
                  </p>
                </div>
              </div>
              <Badge variant={integrations.googleAnalytics.configured ? 'success' : 'error'} size="sm">
                {integrations.googleAnalytics.configured ? 'Active' : 'Inactive'}
              </Badge>
            </div>

            <div className="p-3 bg-olive-700/30 rounded-md">
              <p className="text-xs text-cream-400">
                Configure integrations by setting environment variables:
                <br />
                NEXT_PUBLIC_AMAZON_AFFILIATE_TAG, NEXT_PUBLIC_EBAY_AFFILIATE_TAG, NEXT_PUBLIC_GA_ID
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info */}
      <Card className="bg-olive-700/30 border-olive-600">
        <CardContent className="p-4">
          <h3 className="text-sm font-semibold text-cream-100 mb-2">API Management</h3>
          <p className="text-xs text-cream-400">
            API key management requires an <code className="bg-olive-800 px-1 rounded">api_keys</code> table in the database.
            Currently showing placeholder functionality. Integrations are checked via environment variables.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
