'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FileText, Upload, Download, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { previewImportCSV, importEnginesCSV, importPartsCSV } from '@/actions/admin/import';
import { getEnginesCSVTemplate, getPartsCSVTemplate } from '@/actions/admin/export';

interface CSVImporterProps {
  type: 'engines' | 'parts';
  onImportComplete?: () => void;
}

interface PreviewResult {
  valid: Array<{ row: number; data: unknown }>;
  invalid: Array<{ row: number; data: unknown; error: string }>;
}

export function CSVImporter({ type, onImportComplete }: CSVImporterProps) {
  const [file, setFile] = useState<File | null>(null);
  const [csvText, setCsvText] = useState<string>('');
  const [preview, setPreview] = useState<PreviewResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ success: number; failed: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setError(null);
    setPreview(null);
    setImportResult(null);

    // Read file
    const text = await selectedFile.text();
    setCsvText(text);

    // Auto-preview
    handlePreview(text);
  };

  const handlePreview = async (text?: string) => {
    setLoading(true);
    setError(null);

    try {
      const result = await previewImportCSV(text || csvText, type);
      
      if (result.success && result.data) {
        setPreview(result.data);
      } else if (!result.success) {
        setError('error' in result ? result.error : 'Failed to preview CSV');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Preview failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTemplate = async () => {
    setLoading(true);
    try {
      const result = type === 'engines' 
        ? await getEnginesCSVTemplate()
        : await getPartsCSVTemplate();

      if (result.success && result.data) {
        // Download CSV file
        const blob = new Blob([result.data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${type}-template.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else if (!result.success) {
        setError('error' in result ? result.error : 'Failed to download template');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Template download failed');
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!csvText) return;

    setImporting(true);
    setError(null);
    setImportResult(null);

    try {
      const result = type === 'engines' 
        ? await importEnginesCSV(csvText)
        : await importPartsCSV(csvText);

      if (result.success && result.data) {
        setImportResult({
          success: result.data.success,
          failed: result.data.failed,
        });
        setFile(null);
        setCsvText('');
        setPreview(null);
        onImportComplete?.();
      } else if (!result.success) {
        setError('error' in result ? result.error : 'Import failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed');
    } finally {
      setImporting(false);
    }
  };

  const validCount = preview?.valid.length || 0;
  const invalidCount = preview?.invalid.length || 0;

  return (
    <div className="space-y-6">
      {/* File Upload */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-cream-100">Import {type.charAt(0).toUpperCase() + type.slice(1)}</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Template Download */}
          <div className="flex items-center justify-between p-4 bg-olive-700/50 rounded-md">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-orange-400" />
              <div>
                <p className="text-sm font-medium text-cream-100">CSV Template</p>
                <p className="text-xs text-cream-400">Download template with required headers</p>
              </div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleDownloadTemplate}
              disabled={loading}
              icon={loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            >
              Download Template
            </Button>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-cream-200 mb-2">
              Select CSV File
            </label>
            <div className="flex items-center gap-3">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
                id="csv-file-input"
              />
              <label
                htmlFor="csv-file-input"
                className="flex items-center gap-2 px-4 py-2 bg-olive-700 border border-olive-600 rounded-md text-cream-200 hover:bg-olive-600 cursor-pointer transition-colors"
              >
                <Upload className="w-4 h-4" />
                Choose File
              </label>
              {file && (
                <span className="text-sm text-cream-300">{file.name}</span>
              )}
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-md flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Import Result */}
          {importResult && (
            <div className={`p-4 rounded-md flex items-start gap-3 ${
              importResult.failed === 0 
                ? 'bg-green-500/10 border border-green-500/30' 
                : 'bg-yellow-500/10 border border-yellow-500/30'
            }`}>
              {importResult.failed === 0 ? (
                <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <p className={`text-sm font-medium ${
                  importResult.failed === 0 ? 'text-green-400' : 'text-yellow-400'
                }`}>
                  Import Complete
                </p>
                <p className="text-xs text-cream-400 mt-1">
                  {importResult.success} imported successfully
                  {importResult.failed > 0 && `, ${importResult.failed} failed`}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview */}
      {preview && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-cream-100">Preview</h2>
            <p className="text-sm text-cream-400 mt-1">
              {validCount} valid rows, {invalidCount} errors
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Valid Rows Summary */}
            {validCount > 0 && (
              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-md">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                  <span className="text-sm font-medium text-green-400">
                    {validCount} Valid Row{validCount !== 1 ? 's' : ''}
                  </span>
                </div>
                <p className="text-xs text-cream-400">
                  These rows are ready to import
                </p>
              </div>
            )}

            {/* Invalid Rows */}
            {invalidCount > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-cream-200">Errors</h3>
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {preview.invalid.slice(0, 10).map((item, i) => (
                    <div
                      key={i}
                      className="p-3 bg-red-500/10 border border-red-500/30 rounded-md"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="text-xs font-medium text-red-400">
                            Row {item.row}: {item.error}
                          </p>
                          <p className="text-xs text-cream-400 mt-1 truncate">
                            {typeof item.data === 'object' 
                              ? JSON.stringify(item.data).substring(0, 100)
                              : String(item.data)
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {invalidCount > 10 && (
                    <p className="text-xs text-cream-400 text-center">
                      ... and {invalidCount - 10} more errors
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <CardFooter className="flex justify-end gap-3 pt-4">
              <Button
                variant="secondary"
                onClick={() => {
                  setPreview(null);
                  setFile(null);
                  setCsvText('');
                  setImportResult(null);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleImport}
                disabled={validCount === 0 || importing}
                loading={importing}
              >
                Import {validCount} Row{validCount !== 1 ? 's' : ''}
              </Button>
            </CardFooter>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
