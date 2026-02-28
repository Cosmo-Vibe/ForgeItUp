import type { GenerationConfig, GeneratedFile } from '@forgeitup/shared';
import { logger } from './logger';

// Patterns that should never appear in generated code (security)
const DANGEROUS_PATTERNS = [
  /Runtime\.getRuntime\(\)/,
  /ProcessBuilder/,
  /System\.exit/,
  /File\.delete/,
  /java\.net\.URL/,
  /java\.net\.HttpURLConnection/,
  /curl\s+http/i,
  /wget\s+http/i,
  /exec\(/,
  /eval\(/,
  /\.\.\/\.\.\//,
];

const FILE_DELIMITER_REGEX = /===FILE:\s*([^\n=]+?)===\n?([\s\S]*?)(?====FILE:|$)/g;

export interface ParsedFile {
  path: string;
  content: string;
  language: string;
}

/**
 * Parses the AI response into individual files using the FILE delimiter format.
 * Also validates and sanitizes the content.
 */
export function parseAiResponse(
  aiResponse: { content: string },
  config: GenerationConfig,
): ParsedFile[] {
  const { content } = aiResponse;

  // Strip any accidental markdown fences
  const cleanContent = content
    .replace(/```(?:java|json|toml|gradle|groovy)?\n?/g, '')
    .replace(/```\n?/g, '');

  const files: ParsedFile[] = [];
  let match: RegExpExecArray | null;

  FILE_DELIMITER_REGEX.lastIndex = 0;

  while ((match = FILE_DELIMITER_REGEX.exec(cleanContent)) !== null) {
    const path = match[1].trim();
    const fileContent = match[2].trim();

    if (!path || !fileContent) continue;

    // Sanitize path — prevent path traversal
    const safePath = path.replace(/\.\.\//g, '').replace(/^\//, '');

    // Security scan
    const isDangerous = DANGEROUS_PATTERNS.some((pattern) => pattern.test(fileContent));
    if (isDangerous) {
      logger.warn({ path: safePath }, 'Potentially dangerous code pattern detected, skipping file');
      continue;
    }

    // Validate JSON files
    if (safePath.endsWith('.json')) {
      try {
        JSON.parse(fileContent);
      } catch {
        logger.warn({ path: safePath }, 'Invalid JSON in generated file, attempting fix');
        // Skip invalid JSON files rather than package corrupt data
        continue;
      }
    }

    files.push({
      path: safePath,
      content: fileContent,
      language: getLanguage(safePath),
    });
  }

  // If no files were parsed via delimiters, try to extract from raw content
  if (files.length === 0) {
    logger.warn({ config }, 'No FILE delimiters found, attempting raw extraction');
    files.push(...extractFilesFromRawContent(cleanContent, config));
  }

  // Ensure minimum required files exist
  return addMissingMetadataFiles(files, config);
}

function extractFilesFromRawContent(content: string, config: GenerationConfig): ParsedFile[] {
  const modId = config.modId ?? 'mymod';
  const modName = config.modName ?? 'My Mod';
  const files: ParsedFile[] = [];

  if (config.platform === 'java' && config.type === 'mod') {
    // Try to find Java class in content
    const javaMatch = content.match(/(?:public\s+)?class\s+\w+[\s\S]*}/);
    if (javaMatch) {
      const className = javaMatch[0].match(/class\s+(\w+)/)?.[1] ?? 'MainMod';
      files.push({
        path: `src/main/java/com/${modId}/${className}.java`,
        content: javaMatch[0],
        language: 'java',
      });
    }

    // Add pack.mcmeta
    files.push({
      path: 'src/main/resources/pack.mcmeta',
      content: JSON.stringify({ pack: { pack_format: getPackFormat(config.mcVersion), description: `${modName} resources` } }, null, 2),
      language: 'json',
    });
  }

  return files;
}

function addMissingMetadataFiles(files: ParsedFile[], config: GenerationConfig): ParsedFile[] {
  const modId = config.modId ?? 'mymod';
  const modName = config.modName ?? 'My Mod';
  const author = config.author ?? 'Anonymous';
  const version = config.version ?? '1.0.0';

  const existingPaths = new Set(files.map((f) => f.path));

  if (config.platform === 'java') {
    if (config.loader === 'forge' || config.loader === 'neoforge') {
      // mods.toml
      if (!existingPaths.has('src/main/resources/META-INF/mods.toml')) {
        files.push({
          path: 'src/main/resources/META-INF/mods.toml',
          content: generateModsToml(modId, modName, version, author, config.loader),
          language: 'toml',
        });
      }
    } else if (config.loader === 'fabric') {
      if (!existingPaths.has('src/main/resources/fabric.mod.json')) {
        files.push({
          path: 'src/main/resources/fabric.mod.json',
          content: generateFabricModJson(modId, modName, version, author, config.mcVersion),
          language: 'json',
        });
      }
    } else if (config.loader === 'quilt') {
      if (!existingPaths.has('src/main/resources/quilt.mod.json')) {
        files.push({
          path: 'src/main/resources/quilt.mod.json',
          content: generateQuiltModJson(modId, modName, version, author),
          language: 'json',
        });
      }
    }

    // pack.mcmeta
    if (!existingPaths.has('src/main/resources/pack.mcmeta')) {
      files.push({
        path: 'src/main/resources/pack.mcmeta',
        content: JSON.stringify(
          { pack: { pack_format: getPackFormat(config.mcVersion), description: `${modName} resources` } },
          null,
          2,
        ),
        language: 'json',
      });
    }
  }

  return files;
}

function getPackFormat(mcVersion: string): number {
  const [, minor] = mcVersion.split('.').map(Number);
  if (minor >= 21) return 34;
  if (minor >= 20) return 22;
  if (minor >= 19) return 13;
  if (minor >= 18) return 8;
  if (minor >= 17) return 7;
  if (minor >= 16) return 6;
  return 4;
}

function generateModsToml(
  modId: string,
  modName: string,
  version: string,
  author: string,
  loader: string,
): string {
  return `modLoader="javafml"
loaderVersion="[40,)"
license="All Rights Reserved"

[[mods]]
modId="${modId}"
version="${version}"
displayName="${modName}"
description="${modName} mod"

[[dependencies.${modId}]]
modId="${loader === 'neoforge' ? 'neoforge' : 'forge'}"
mandatory=true
versionRange="[1,)"
ordering="NONE"
side="BOTH"

[[dependencies.${modId}]]
modId="minecraft"
mandatory=true
versionRange="[1.20,)"
ordering="NONE"
side="BOTH"`;
}

function generateFabricModJson(
  modId: string,
  modName: string,
  version: string,
  author: string,
  mcVersion: string,
): string {
  return JSON.stringify(
    {
      schemaVersion: 1,
      id: modId,
      version,
      name: modName,
      description: `${modName} mod`,
      authors: [author],
      contact: {},
      license: 'All Rights Reserved',
      environment: '*',
      entrypoints: {
        main: [`com.${modId}.MainMod`],
      },
      depends: {
        fabricloader: '>=0.14.0',
        minecraft: `>=${mcVersion}`,
        java: '>=17',
      },
    },
    null,
    2,
  );
}

function generateQuiltModJson(
  modId: string,
  modName: string,
  version: string,
  author: string,
): string {
  return JSON.stringify(
    {
      schema_version: 1,
      quilt_loader: {
        group: `com.${modId}`,
        id: modId,
        version,
        metadata: {
          name: modName,
          contributors: { [author]: 'Owner' },
          license: 'All Rights Reserved',
        },
        intermediate_mappings: 'net.fabricmc:intermediary',
        entrypoints: {
          init: [{ value: `com.${modId}.MainMod` }],
        },
        depends: [{ id: 'quilt_loader', versions: '>=0.19.0' }],
      },
    },
    null,
    2,
  );
}

function getLanguage(filePath: string): string {
  const ext = filePath.split('.').pop()?.toLowerCase() ?? '';
  const langMap: Record<string, string> = {
    java: 'java',
    json: 'json',
    toml: 'toml',
    gradle: 'groovy',
    groovy: 'groovy',
    mcmeta: 'json',
    properties: 'properties',
    txt: 'text',
    md: 'markdown',
    xml: 'xml',
    kt: 'kotlin',
  };
  return langMap[ext] ?? 'text';
}

// Re-export GeneratedFile type that includes size
export type { GeneratedFile };
