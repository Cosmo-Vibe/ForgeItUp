'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Zap,
  Wrench,
  Loader2,
  CheckCircle2,
  Sparkles,
  Settings,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ModeSelector } from '@/components/builder/mode-selector';
import { VersionPicker } from '@/components/builder/version-picker';
import { LoaderDetector } from '@/components/builder/loader-detector';
import { PromptInput } from '@/components/builder/prompt-input';
import { GenerationStatus } from '@/components/builder/generation-status';
import { OutputPreview } from '@/components/builder/output-preview';
import { useBuilderStore } from '@/stores/builder-store';
import { useGenerationStore } from '@/stores/generation-store';
import { generationsApi } from '@/lib/api-client';
import { sanitizeModId } from '@forgeitup/shared';
import type { GenerationMode } from '@forgeitup/shared';

const STEPS = [
  { id: 1, label: 'Platform & Type', icon: Zap },
  { id: 2, label: 'Version & Loader', icon: Settings },
  { id: 3, label: 'Create', icon: Sparkles },
  { id: 4, label: 'Generate', icon: Loader2 },
  { id: 5, label: 'Download', icon: CheckCircle2 },
];

export default function BuilderPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);

  const store = useBuilderStore();
  const generationStore = useGenerationStore();

  const handleModNameChange = (name: string) => {
    store.setModName(name);
    if (!store.modId || store.modId === sanitizeModId(store.modName)) {
      store.setModId(sanitizeModId(name));
    }
  };

  const handleGenerate = async () => {
    if (!store.platform || !store.type || !store.loader || !store.mcVersion) {
      toast.error('Please complete all required fields');
      return;
    }

    if (store.mode === 'ai' && !store.prompt.trim()) {
      toast.error('Please enter a prompt describing your mod');
      return;
    }

    setIsGenerating(true);
    store.goToStep(4);

    try {
      const result = await generationsApi.create({
        platform: store.platform,
        type: store.type,
        loader: store.loader,
        mcVersion: store.mcVersion,
        loaderVersion: store.loaderVersion ?? 'latest',
        mode: store.mode,
        prompt: store.mode === 'ai' ? store.prompt : undefined,
        features: store.mode === 'manual' ? store.features : undefined,
        modId: store.modId || sanitizeModId(store.modName || 'mymod'),
        modName: store.modName || 'My Mod',
        author: store.author || 'Anonymous',
        description: store.description,
        version: store.version,
      });

      if (!result.success || !result.data) {
        throw new Error(result.error ?? 'Generation failed');
      }

      generationStore.setCurrentGenerationId(result.data.id);

      // Poll for status
      const pollInterval = setInterval(async () => {
        try {
          const statusResult = await generationsApi.get(result.data!.id);
          if (statusResult.success && statusResult.data) {
            const gen = statusResult.data;
            generationStore.setCurrentGeneration(gen);
            generationStore.updateStatus(gen.status);

            if (gen.status === 'done') {
              clearInterval(pollInterval);
              generationStore.updateStatus('done', 100);
              store.goToStep(5);
              setIsGenerating(false);
            } else if (gen.status === 'failed') {
              clearInterval(pollInterval);
              setIsGenerating(false);
              store.goToStep(3);
              toast.error(gen.errorMessage ?? 'Generation failed. Please try again.');
            }
          }
        } catch {
          clearInterval(pollInterval);
          setIsGenerating(false);
        }
      }, 2000);

      // Timeout after 2 minutes
      setTimeout(() => {
        clearInterval(pollInterval);
        if (isGenerating) {
          setIsGenerating(false);
          store.goToStep(3);
          toast.error('Generation timed out. Please try again.');
        }
      }, 120000);

    } catch (error) {
      setIsGenerating(false);
      store.goToStep(3);
      toast.error(error instanceof Error ? error.message : 'Generation failed');
    }
  };

  const canProceedStep1 = store.platform && store.type;
  const canProceedStep2 = store.mcVersion && store.loader;
  const canProceedStep3 = store.mode === 'ai' ? store.prompt.trim().length > 10 : store.features.length > 0;

  return (
    <div className="flex h-full flex-col">
      {/* Step Indicator */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#F5F5F5]">Mod Builder</h1>
        <div className="hidden items-center gap-2 sm:flex">
          {STEPS.slice(0, 3).map((step, i) => {
            const isActive = store.currentStep === step.id;
            const isDone = store.currentStep > step.id;
            return (
              <div key={step.id} className="flex items-center gap-2">
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium transition-all ${
                    isDone
                      ? 'bg-primary text-black'
                      : isActive
                      ? 'bg-primary/20 text-primary ring-1 ring-primary'
                      : 'bg-[#242424] text-[#8A8A8A]'
                  }`}
                >
                  {isDone ? <CheckCircle2 className="h-4 w-4" /> : step.id}
                </div>
                <span
                  className={`text-xs ${
                    isActive ? 'text-[#F5F5F5]' : 'text-[#8A8A8A]'
                  }`}
                >
                  {step.label}
                </span>
                {i < 2 && <ChevronRight className="h-4 w-4 text-[#8A8A8A]" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 gap-6 overflow-hidden">
        <AnimatePresence mode="wait">
          {/* Step 1: Platform & Type */}
          {store.currentStep === 1 && (
            <motion.div
              key="step1"
              className="flex-1 overflow-y-auto"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <div className="max-w-2xl space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-[#F5F5F5]">Choose your platform</h2>
                  <p className="text-sm text-[#8A8A8A]">Select what kind of Minecraft mod you want to create</p>
                </div>
                <ModeSelector
                  selectedPlatform={store.platform}
                  selectedType={store.type}
                  onPlatformChange={store.setPlatform}
                  onTypeChange={store.setType}
                />
                <Button
                  onClick={store.nextStep}
                  disabled={!canProceedStep1}
                  className="mt-4"
                >
                  Continue
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Version & Loader */}
          {store.currentStep === 2 && (
            <motion.div
              key="step2"
              className="flex-1 overflow-y-auto"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="max-w-2xl space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-[#F5F5F5]">Select version & loader</h2>
                  <p className="text-sm text-[#8A8A8A]">Choose the Minecraft version and mod loader</p>
                </div>

                {store.platform && (
                  <>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-[#F5F5F5]">
                        Minecraft Version
                      </label>
                      <VersionPicker
                        platform={store.platform}
                        selectedVersion={store.mcVersion}
                        onVersionChange={store.setMcVersion}
                      />
                    </div>

                    {store.mcVersion && (
                      <div>
                        <label className="mb-2 block text-sm font-medium text-[#F5F5F5]">
                          Mod Loader
                        </label>
                        <LoaderDetector
                          platform={store.platform}
                          mcVersion={store.mcVersion}
                          selectedLoader={store.loader}
                          onLoaderChange={store.setLoader}
                        />
                      </div>
                    )}
                  </>
                )}

                <div className="flex gap-3">
                  <Button variant="outline" onClick={store.prevStep}>
                    <ChevronLeft className="h-4 w-4" />
                    Back
                  </Button>
                  <Button onClick={store.nextStep} disabled={!canProceedStep2}>
                    Continue
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Creation Mode */}
          {store.currentStep === 3 && (
            <motion.div
              key="step3"
              className="flex-1 overflow-y-auto"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="max-w-3xl space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-[#F5F5F5]">Create your mod</h2>
                  <p className="text-sm text-[#8A8A8A]">
                    Describe your mod or configure it manually
                  </p>
                </div>

                {/* Mode Toggle */}
                <div className="flex gap-2">
                  {([['ai', 'AI Mode', Sparkles], ['manual', 'Manual', Wrench]] as [GenerationMode, string, typeof Sparkles][]).map(([m, label, Icon]) => (
                    <button
                      key={m}
                      onClick={() => store.setMode(m)}
                      className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-all ${
                        store.mode === m
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-[#2E2E2E] bg-[#1A1A1A] text-[#8A8A8A] hover:bg-[#242424]'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {label}
                    </button>
                  ))}
                </div>

                {/* Mod Metadata */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-[#F5F5F5]">
                      Mod Name
                    </label>
                    <Input
                      placeholder="My Awesome Mod"
                      value={store.modName}
                      onChange={(e) => handleModNameChange(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-[#F5F5F5]">
                      Mod ID <span className="text-[#8A8A8A]">(auto)</span>
                    </label>
                    <Input
                      placeholder="my_awesome_mod"
                      value={store.modId}
                      onChange={(e) => store.setModId(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_'))}
                      className="font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-[#F5F5F5]">Author</label>
                    <Input
                      placeholder="Your name"
                      value={store.author}
                      onChange={(e) => store.setAuthor(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-[#F5F5F5]">Version</label>
                    <Input
                      placeholder="1.0.0"
                      value={store.version}
                      onChange={(e) => store.setVersion(e.target.value)}
                    />
                  </div>
                </div>

                {/* AI Mode: Prompt */}
                {store.mode === 'ai' && store.loader && store.mcVersion && (
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#F5F5F5]">
                      Describe your mod
                    </label>
                    <PromptInput
                      value={store.prompt}
                      onChange={store.setPrompt}
                      platform={store.platform!}
                      loader={store.loader}
                      mcVersion={store.mcVersion}
                    />
                  </div>
                )}

                {/* Manual Mode placeholder */}
                {store.mode === 'manual' && (
                  <div className="rounded-xl border border-dashed border-[#2E2E2E] p-8 text-center">
                    <Wrench className="mx-auto mb-3 h-10 w-10 text-[#8A8A8A]" />
                    <p className="font-medium text-[#F5F5F5]">Manual Builder</p>
                    <p className="mt-1 text-sm text-[#8A8A8A]">
                      Drag & drop feature builder coming soon. Use AI mode for now.
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => store.setMode('ai')}
                      className="mt-3 text-primary"
                    >
                      Switch to AI Mode
                    </Button>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button variant="outline" onClick={store.prevStep}>
                    <ChevronLeft className="h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    onClick={handleGenerate}
                    disabled={!canProceedStep3 || isGenerating}
                    variant="gradient"
                    size="lg"
                  >
                    {isGenerating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Zap className="h-4 w-4" />
                    )}
                    Generate Mod
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 4: Generation Progress */}
          {store.currentStep === 4 && (
            <motion.div
              key="step4"
              className="flex flex-1 items-start justify-center overflow-y-auto pt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="w-full max-w-md">
                <GenerationStatus
                  generationId={generationStore.currentGenerationId ?? 'unknown'}
                  status={generationStore.status ?? 'processing'}
                  progress={generationStore.progress}
                  logs={generationStore.logs}
                />
              </div>
            </motion.div>
          )}

          {/* Step 5: Output Preview */}
          {store.currentStep === 5 && generationStore.currentGeneration && (
            <motion.div
              key="step5"
              className="flex flex-1 flex-col overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-[#F5F5F5]">
                    Your mod is ready!
                  </h2>
                  <p className="text-sm text-[#8A8A8A]">
                    Preview the generated files and download your mod
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    store.reset();
                    generationStore.reset();
                  }}
                >
                  New Generation
                </Button>
              </div>

              <div className="flex-1 overflow-hidden rounded-xl border border-[#2E2E2E] bg-[#1A1A1A]">
                <OutputPreview
                  files={(generationStore.currentGeneration.outputFiles?.files ?? []) as { path: string; content: string; language: string; size: number }[]}
                  downloadUrl={generationStore.currentGeneration.outputFiles?.downloadUrl}
                  generationId={generationStore.currentGenerationId ?? ''}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
