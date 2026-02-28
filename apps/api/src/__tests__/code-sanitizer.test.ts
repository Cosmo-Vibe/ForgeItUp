import { describe, it, expect } from 'vitest';
import { parseAiResponse } from '../utils/code-sanitizer';
import type { GenerationConfig } from '@forgeitup/shared';

const FORGE_CONFIG: GenerationConfig = {
  platform: 'java',
  type: 'mod',
  loader: 'forge',
  mcVersion: '1.20.1',
  loaderVersion: '47.2.0',
  mode: 'ai',
  modId: 'testmod',
  modName: 'Test Mod',
  author: 'TestAuthor',
  version: '1.0.0',
};

describe('parseAiResponse', () => {
  it('parses FILE delimiters correctly', () => {
    const content = `===FILE: src/main/java/com/testmod/TestMod.java===
public class TestMod {}

===FILE: src/main/resources/pack.mcmeta===
{"pack": {"pack_format": 15, "description": "Test"}}`;

    const files = parseAiResponse({ content }, FORGE_CONFIG);
    expect(files.length).toBeGreaterThanOrEqual(2);
    expect(files.some((f) => f.path.includes('TestMod.java'))).toBe(true);
    expect(files.some((f) => f.path.includes('pack.mcmeta'))).toBe(true);
  });

  it('strips markdown code fences', () => {
    const content = `===FILE: test.java===
\`\`\`java
public class Test {}
\`\`\``;

    const files = parseAiResponse({ content }, FORGE_CONFIG);
    const javaFile = files.find((f) => f.path === 'test.java');
    expect(javaFile).toBeDefined();
    expect(javaFile?.content).not.toContain('```');
  });

  it('rejects dangerous code patterns', () => {
    const content = `===FILE: evil.java===
public class Evil {
  public void hack() {
    Runtime.getRuntime().exec("rm -rf /");
  }
}`;

    const files = parseAiResponse({ content }, FORGE_CONFIG);
    expect(files.find((f) => f.path === 'evil.java')).toBeUndefined();
  });

  it('prevents path traversal', () => {
    const content = `===FILE: ../../etc/passwd===
root:x:0:0:root:/root:/bin/bash`;

    const files = parseAiResponse({ content }, FORGE_CONFIG);
    const file = files.find((f) => f.path.includes('passwd'));
    if (file) {
      expect(file.path).not.toContain('..');
    }
  });

  it('adds metadata files for Forge if missing', () => {
    const content = `===FILE: src/main/java/com/testmod/TestMod.java===
public class TestMod {}`;

    const files = parseAiResponse({ content }, FORGE_CONFIG);
    expect(files.some((f) => f.path.includes('mods.toml'))).toBe(true);
    expect(files.some((f) => f.path.includes('pack.mcmeta'))).toBe(true);
  });

  it('correctly identifies file languages', () => {
    const content = `===FILE: test.java===
public class Test {}

===FILE: config.json===
{"key": "value"}

===FILE: build.gradle===
plugins { id 'java' }`;

    const files = parseAiResponse({ content }, FORGE_CONFIG);
    expect(files.find((f) => f.path === 'test.java')?.language).toBe('java');
    expect(files.find((f) => f.path === 'config.json')?.language).toBe('json');
    expect(files.find((f) => f.path === 'build.gradle')?.language).toBe('groovy');
  });
});
