'use client';

import { useState } from 'react';
import { Download, Copy, Check, File, Folder, ChevronRight, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { formatBytes } from '@/lib/utils';
import type { GeneratedFile } from '@forgeitup/shared';

interface OutputPreviewProps {
  files: GeneratedFile[];
  downloadUrl?: string;
  generationId: string;
}

interface FileTreeNode {
  name: string;
  type: 'file' | 'folder';
  path: string;
  children?: FileTreeNode[];
  file?: GeneratedFile;
}

function buildFileTree(files: GeneratedFile[]): FileTreeNode[] {
  const root: FileTreeNode[] = [];

  for (const file of files) {
    const parts = file.path.split('/');
    let current = root;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isLast = i === parts.length - 1;
      let node = current.find((n) => n.name === part);

      if (!node) {
        node = {
          name: part,
          type: isLast ? 'file' : 'folder',
          path: parts.slice(0, i + 1).join('/'),
          children: isLast ? undefined : [],
          file: isLast ? file : undefined,
        };
        current.push(node);
      }

      if (!isLast) {
        current = node.children!;
      }
    }
  }

  return root;
}

function FileTreeItem({ node, depth = 0, onSelect, selectedPath }: {
  node: FileTreeNode;
  depth?: number;
  onSelect: (path: string) => void;
  selectedPath: string | null;
}) {
  const [isOpen, setIsOpen] = useState(depth < 2);

  if (node.type === 'folder') {
    return (
      <div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex w-full items-center gap-1.5 rounded px-2 py-1 text-left text-sm text-[#8A8A8A] hover:bg-[#242424] hover:text-[#F5F5F5]"
          style={{ paddingLeft: `${8 + depth * 16}px` }}
        >
          {isOpen ? (
            <ChevronDown className="h-3 w-3 shrink-0" />
          ) : (
            <ChevronRight className="h-3 w-3 shrink-0" />
          )}
          <Folder className="h-3.5 w-3.5 shrink-0 text-yellow-400" />
          <span>{node.name}</span>
        </button>
        {isOpen && node.children?.map((child) => (
          <FileTreeItem
            key={child.path}
            node={child}
            depth={depth + 1}
            onSelect={onSelect}
            selectedPath={selectedPath}
          />
        ))}
      </div>
    );
  }

  const ext = node.name.split('.').pop() ?? '';
  const langColor: Record<string, string> = {
    java: '#5C99D6',
    json: '#FBBF24',
    toml: '#F97316',
    gradle: '#4CAF50',
    ts: '#3B82F6',
  };

  return (
    <button
      onClick={() => onSelect(node.path)}
      className={cn(
        'flex w-full items-center gap-1.5 rounded px-2 py-1 text-left text-sm transition-all',
        selectedPath === node.path
          ? 'bg-primary/10 text-primary'
          : 'text-[#8A8A8A] hover:bg-[#242424] hover:text-[#F5F5F5]',
      )}
      style={{ paddingLeft: `${8 + depth * 16}px` }}
    >
      <File className="h-3.5 w-3.5 shrink-0" style={{ color: langColor[ext] ?? '#8A8A8A' }} />
      <span className="truncate">{node.name}</span>
      <span className="ml-auto text-[10px]">{ext}</span>
    </button>
  );
}

export function OutputPreview({ files, downloadUrl, generationId }: OutputPreviewProps) {
  const [selectedPath, setSelectedPath] = useState<string | null>(files[0]?.path ?? null);
  const [copiedPath, setCopiedPath] = useState<string | null>(null);

  const fileTree = buildFileTree(files);
  const selectedFile = files.find((f) => f.path === selectedPath);

  const totalSize = files.reduce((sum, f) => sum + f.size, 0);

  const handleCopy = async (content: string, path: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedPath(path);
    setTimeout(() => setCopiedPath(null), 2000);
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#2E2E2E] p-4">
        <div>
          <p className="text-sm font-medium text-[#F5F5F5]">
            {files.length} files generated
          </p>
          <p className="text-xs text-[#8A8A8A]">Total size: {formatBytes(totalSize)}</p>
        </div>
        {downloadUrl && (
          <a href={downloadUrl} download>
            <Button size="sm" variant="gradient">
              <Download className="h-4 w-4" />
              Download All
            </Button>
          </a>
        )}
      </div>

      <Tabs defaultValue="code" className="flex flex-1 flex-col overflow-hidden">
        <TabsList className="mx-4 mt-2 justify-start">
          <TabsTrigger value="code">Code</TabsTrigger>
          <TabsTrigger value="structure">Structure</TabsTrigger>
        </TabsList>

        <TabsContent value="code" className="flex flex-1 overflow-hidden gap-0 m-0 mt-2">
          {/* File Tree */}
          <div className="w-48 shrink-0 overflow-y-auto border-r border-[#2E2E2E] py-2 lg:w-56">
            {fileTree.map((node) => (
              <FileTreeItem
                key={node.path}
                node={node}
                onSelect={setSelectedPath}
                selectedPath={selectedPath}
              />
            ))}
          </div>

          {/* Code Viewer */}
          <div className="flex flex-1 flex-col overflow-hidden">
            {selectedFile ? (
              <>
                <div className="flex items-center justify-between border-b border-[#2E2E2E] px-4 py-2">
                  <div className="flex items-center gap-2">
                    <File className="h-4 w-4 text-[#8A8A8A]" />
                    <span className="font-mono text-xs text-[#F5F5F5]">{selectedFile.path}</span>
                    <Badge variant="outline" className="text-[10px]">
                      {selectedFile.language}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(selectedFile.content, selectedFile.path)}
                    className="h-7 text-[#8A8A8A]"
                  >
                    {copiedPath === selectedFile.path ? (
                      <Check className="h-3.5 w-3.5 text-primary" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                    {copiedPath === selectedFile.path ? 'Copied!' : 'Copy'}
                  </Button>
                </div>
                <pre className="flex-1 overflow-auto p-4 font-mono text-xs text-[#F5F5F5] leading-6">
                  <code>{selectedFile.content}</code>
                </pre>
              </>
            ) : (
              <div className="flex flex-1 items-center justify-center text-[#8A8A8A]">
                Select a file to preview
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="structure" className="flex-1 overflow-auto p-4">
          <div className="space-y-2">
            {files.map((file) => (
              <div
                key={file.path}
                className="flex items-center justify-between rounded-lg border border-[#2E2E2E] bg-[#1A1A1A] px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <File className="h-4 w-4 shrink-0 text-[#8A8A8A]" />
                  <span className="font-mono text-xs text-[#F5F5F5]">{file.path}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px]">{file.language}</Badge>
                  <span className="text-xs text-[#8A8A8A]">{formatBytes(file.size)}</span>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
