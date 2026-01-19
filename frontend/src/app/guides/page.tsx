import { Metadata } from 'next';
import Link from 'next/link';
import { BookOpen, Clock, AlertTriangle, Filter, Search } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { GuidesList } from '@/components/guides/GuidesList';

export const metadata: Metadata = {
  title: 'Installation Guides - GoKartPartPicker',
  description: 'Step-by-step installation guides for go-kart parts and engines. Learn how to install, maintain, and upgrade your kart.',
};

export default function GuidesPage() {
  return (
    <div className="min-h-screen bg-olive-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-display text-4xl md:text-5xl text-cream-100 mb-4">
            Installation Guides
          </h1>
          <p className="text-lg text-cream-300 max-w-2xl">
            Step-by-step guides to help you install, maintain, and upgrade your go-kart parts and engines.
          </p>
        </div>

        {/* Guides List */}
        <GuidesList />
      </div>
    </div>
  );
}
