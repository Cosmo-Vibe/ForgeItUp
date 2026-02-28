'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { History, Download, GitFork, Trash2, RefreshCw, Package, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { generationsApi } from '@/lib/api-client';
import { formatRelativeTime } from '@/lib/utils';
import type { Generation } from '@forgeitup/shared';

const STATUS_CONFIG = {
  pending: { label: 'Pending', variant: 'outline' as const, color: 'text-[#8A8A8A]' },
  processing: { label: 'Processing', variant: 'warning' as const, color: 'text-yellow-400' },
  done: { label: 'Done', variant: 'success' as const, color: 'text-emerald-400' },
  failed: { label: 'Failed', variant: 'destructive' as const, color: 'text-red-400' },
};

export default function GenerationsPage() {
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadGenerations();
  }, []);

  const loadGenerations = async () => {
    setIsLoading(true);
    try {
      const result = await generationsApi.list();
      if (result.success && result.data) {
        setGenerations(result.data.items);
      }
    } catch {
      toast.error('Failed to load generations');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await generationsApi.delete(id);
      setGenerations((prev) => prev.filter((g) => g.id !== id));
      toast.success('Generation deleted');
    } catch {
      toast.error('Failed to delete generation');
    } finally {
      setDeletingId(null);
    }
  };

  const handleDownload = async (id: string) => {
    try {
      const result = await generationsApi.getDownloadUrl(id);
      if (result.success && result.data) {
        window.open(result.data.url, '_blank');
      }
    } catch {
      toast.error('Failed to get download link');
    }
  };

  const handleFork = async (id: string) => {
    try {
      const result = await generationsApi.fork(id);
      if (result.success && result.data) {
        toast.success('Generation forked! Redirecting to builder...');
        // Could redirect to builder with fork id
      }
    } catch {
      toast.error('Failed to fork generation');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#F5F5F5]">Generation History</h1>
          <p className="text-sm text-[#8A8A8A]">
            {generations.length} total generation{generations.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadGenerations}>
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Link href="/builder">
            <Button size="sm" variant="gradient">
              New Generation
            </Button>
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : generations.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#2E2E2E] py-24 text-center">
          <History className="mx-auto mb-4 h-12 w-12 text-[#8A8A8A]" />
          <h3 className="text-lg font-medium text-[#F5F5F5]">No generations yet</h3>
          <p className="mt-2 text-sm text-[#8A8A8A]">
            Create your first mod, datapack, or add-on to see it here.
          </p>
          <Link href="/builder">
            <Button variant="gradient" className="mt-6">
              Start Building
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {generations.map((gen) => {
            const statusConfig = STATUS_CONFIG[gen.status];
            return (
              <Card key={gen.id} className="border-[#2E2E2E] bg-[#1A1A1A]">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#242424]">
                    <Package className="h-5 w-5 text-[#8A8A8A]" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-[#F5F5F5] truncate">
                        {gen.prompt
                          ? gen.prompt.slice(0, 60) + (gen.prompt.length > 60 ? '...' : '')
                          : `${gen.type} — ${gen.loader} ${gen.mcVersion}`}
                      </p>
                      <Badge variant={gen.loader as 'forge' | 'fabric' | 'neoforge' | 'bedrock' | 'quilt'}>
                        {gen.loader}
                      </Badge>
                      <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
                    </div>
                    <div className="mt-1 flex gap-3 text-xs text-[#8A8A8A]">
                      <span className="capitalize">{gen.platform}</span>
                      <span>MC {gen.mcVersion}</span>
                      <span className="capitalize">{gen.mode} mode</span>
                      {gen.generationTimeMs && (
                        <span>{(gen.generationTimeMs / 1000).toFixed(1)}s</span>
                      )}
                      <span>{formatRelativeTime(gen.createdAt)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {gen.status === 'done' && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDownload(gen.id)}
                          title="Download"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleFork(gen.id)}
                          title="Fork"
                        >
                          <GitFork className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(gen.id)}
                      disabled={deletingId === gen.id}
                      className="text-red-400 hover:text-red-400"
                      title="Delete"
                    >
                      {deletingId === gen.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
