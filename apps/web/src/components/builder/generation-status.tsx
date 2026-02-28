'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Loader2, Terminal } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { GenerationStatus as GenerationStatusType } from '@forgeitup/shared';

interface GenerationStatusProps {
  generationId: string;
  status: GenerationStatusType;
  progress: number;
  logs: string[];
  onComplete?: () => void;
  onCancel?: () => void;
}

const STATUS_MESSAGES: Record<GenerationStatusType, string> = {
  pending: 'Queued for processing...',
  processing: 'Generating your mod...',
  done: 'Generation complete!',
  failed: 'Generation failed',
};

const STEPS = [
  { label: 'Validating input', threshold: 10 },
  { label: 'Building AI prompt', threshold: 20 },
  { label: 'Calling AI model', threshold: 50 },
  { label: 'Parsing response', threshold: 70 },
  { label: 'Processing code', threshold: 85 },
  { label: 'Packaging files', threshold: 95 },
  { label: 'Uploading to storage', threshold: 100 },
];

export function GenerationStatus({
  generationId,
  status,
  progress,
  logs,
  onComplete,
  onCancel,
}: GenerationStatusProps) {
  const [showLogs, setShowLogs] = useState(false);
  const currentStep = STEPS.findIndex((s) => progress < s.threshold);
  const activeStep = currentStep === -1 ? STEPS.length - 1 : currentStep;

  useEffect(() => {
    if (status === 'done' && onComplete) {
      const timer = setTimeout(onComplete, 1500);
      return () => clearTimeout(timer);
    }
  }, [status, onComplete]);

  return (
    <div className="space-y-6">
      {/* Status Header */}
      <div className="text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={status}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="mb-4 inline-flex items-center justify-center"
          >
            {status === 'done' ? (
              <CheckCircle2 className="h-16 w-16 text-primary" />
            ) : status === 'failed' ? (
              <XCircle className="h-16 w-16 text-red-400" />
            ) : (
              <div className="relative">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="h-16 w-16 rounded-full border-4 border-[#2E2E2E] border-t-primary"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-mono text-primary">{Math.round(progress)}%</span>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <h3 className="text-lg font-semibold text-[#F5F5F5]">{STATUS_MESSAGES[status]}</h3>
        <p className="text-sm text-[#8A8A8A]">Generation ID: {generationId.slice(0, 8)}...</p>
      </div>

      {/* Progress Bar */}
      {(status === 'processing' || status === 'pending') && (
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between text-xs text-[#8A8A8A]">
            <span>{STEPS[activeStep]?.label ?? 'Processing...'}</span>
            <span>{Math.round(progress)}%</span>
          </div>
        </div>
      )}

      {/* Steps */}
      <div className="space-y-2">
        {STEPS.map((step, i) => {
          const isDone = progress >= step.threshold;
          const isActive = i === activeStep && status === 'processing';

          return (
            <div
              key={step.label}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all',
                isDone ? 'text-[#F5F5F5]' : 'text-[#8A8A8A]',
                isActive && 'bg-[#1A1A1A]',
              )}
            >
              <div
                className={cn(
                  'flex h-5 w-5 shrink-0 items-center justify-center rounded-full',
                  isDone ? 'bg-primary/20 text-primary' : 'bg-[#242424]',
                )}
              >
                {isDone ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                ) : isActive ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                ) : (
                  <span className="text-[10px] text-[#8A8A8A]">{i + 1}</span>
                )}
              </div>
              <span>{step.label}</span>
            </div>
          );
        })}
      </div>

      {/* Live Logs */}
      {logs.length > 0 && (
        <div>
          <button
            onClick={() => setShowLogs(!showLogs)}
            className="flex items-center gap-2 text-xs text-[#8A8A8A] hover:text-[#F5F5F5]"
          >
            <Terminal className="h-3.5 w-3.5" />
            {showLogs ? 'Hide' : 'Show'} logs ({logs.length} lines)
          </button>

          {showLogs && (
            <div className="mt-2 max-h-40 overflow-y-auto rounded-lg border border-[#2E2E2E] bg-[#0F0F0F] p-3 font-mono text-xs text-[#8A8A8A]">
              {logs.map((log, i) => (
                <div key={i} className="leading-5">
                  {log}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      {status === 'processing' || status === 'pending' ? (
        onCancel && (
          <Button variant="outline" size="sm" onClick={onCancel} className="w-full text-[#8A8A8A]">
            Cancel Generation
          </Button>
        )
      ) : null}
    </div>
  );
}
