import archiver from 'archiver';
import { Readable } from 'stream';
import type { ParsedFile } from './code-sanitizer';

/**
 * Creates an in-memory ZIP archive from the given files.
 */
export async function createZipArchive(files: ParsedFile[]): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const archive = archiver('zip', { zlib: { level: 9 } });
    const chunks: Buffer[] = [];

    archive.on('data', (chunk: Buffer) => chunks.push(chunk));
    archive.on('end', () => resolve(Buffer.concat(chunks)));
    archive.on('error', reject);

    for (const file of files) {
      const stream = Readable.from([file.content]);
      archive.append(stream, { name: file.path });
    }

    archive.finalize();
  });
}
