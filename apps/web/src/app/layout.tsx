import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import './globals.css';
import { AuthProvider } from '@/components/providers/auth-provider';
import { ThemeProvider } from '@/components/providers/theme-provider';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: {
    default: 'ForgeItUp — Generate Minecraft Mods in Seconds',
    template: '%s | ForgeItUp',
  },
  description:
    'Create Minecraft mods, datapacks, and add-ons instantly using AI or our visual builder. Supports Forge, Fabric, NeoForge, Quilt, and Bedrock.',
  keywords: [
    'Minecraft mod generator',
    'Forge mod creator',
    'Fabric mod maker',
    'Minecraft modding AI',
    'datapack generator',
    'Bedrock add-on',
  ],
  authors: [{ name: 'ForgeItUp' }],
  creator: 'ForgeItUp',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://forgeitup.com',
    title: 'ForgeItUp — Generate Minecraft Mods in Seconds',
    description:
      'Create Minecraft mods, datapacks, and add-ons instantly using AI or our visual builder.',
    siteName: 'ForgeItUp',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ForgeItUp — Generate Minecraft Mods in Seconds',
    description:
      'Create Minecraft mods, datapacks, and add-ons instantly using AI or our visual builder.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans bg-[#0F0F0F] text-[#F5F5F5]`}>
        <ThemeProvider>
          <AuthProvider>
            {children}
            <Toaster
              theme="dark"
              position="bottom-right"
              toastOptions={{
                style: {
                  background: '#1A1A1A',
                  border: '1px solid #2E2E2E',
                  color: '#F5F5F5',
                },
              }}
            />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
