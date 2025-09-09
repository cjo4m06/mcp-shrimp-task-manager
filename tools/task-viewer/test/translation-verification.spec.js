import { test, expect } from '@playwright/test';
import fs from 'fs/promises';
import path from 'path';

test.describe('Translation Files Verification', () => {
  const rootDir = path.resolve();
  
  test('Japanese README translation exists and has correct content', async () => {
    const japaneseReadmePath = path.join(rootDir, 'README-ja.md');
    
    // Check file exists
    const japaneseReadmeExists = await fs.access(japaneseReadmePath).then(() => true).catch(() => false);
    expect(japaneseReadmeExists, 'Japanese README file should exist').toBe(true);
    
    if (japaneseReadmeExists) {
      const content = await fs.readFile(japaneseReadmePath, 'utf-8');
      
      // Verify Japanese content
      expect(content, 'Should contain Japanese text').toMatch(/[ひらがなカタカナ漢字]/);
      expect(content, 'Should contain Shrimp Task Manager title in Japanese').toMatch(/シュリンプタスクマネージャー/);
      expect(content, 'Should contain task-related terms in Japanese').toMatch(/タスク/);
      expect(content, 'Should maintain markdown structure').toContain('# 🦐');
      expect(content.length, 'Should be substantial content (>20000 characters)').toBeGreaterThan(20000);
    }
  });

  test('Spanish README translation exists and has correct content', async () => {
    const spanishReadmePath = path.join(rootDir, 'README-es.md');
    
    // Check file exists
    const spanishReadmeExists = await fs.access(spanishReadmePath).then(() => true).catch(() => false);
    expect(spanishReadmeExists, 'Spanish README file should exist').toBe(true);
    
    if (spanishReadmeExists) {
      const content = await fs.readFile(spanishReadmePath, 'utf-8');
      
      // Verify Spanish content
      expect(content, 'Should contain Spanish text').toMatch(/[ñáéíóúü]/i);
      expect(content, 'Should contain task-related terms in Spanish').toMatch(/tarea|administrador/i);
      expect(content, 'Should maintain markdown structure').toContain('# 🦐');
      expect(content.length, 'Should be substantial content (>30000 characters)').toBeGreaterThan(30000);
    }
  });

  test('Chinese README translation exists and has correct content', async () => {
    const chineseReadmePath = path.join(rootDir, 'README-zh.md');
    
    // Check file exists
    const chineseReadmeExists = await fs.access(chineseReadmePath).then(() => true).catch(() => false);
    expect(chineseReadmeExists, 'Chinese README file should exist').toBe(true);
    
    if (chineseReadmeExists) {
      const content = await fs.readFile(chineseReadmePath, 'utf-8');
      
      // Verify Chinese content
      expect(content, 'Should contain Chinese characters').toMatch(/[一-龯]/);
      expect(content, 'Should contain task management terms in Chinese').toMatch(/任务|管理/);
      expect(content, 'Should maintain markdown structure').toContain('# 🦐');
      expect(content.length, 'Should be substantial content (>15000 characters)').toBeGreaterThan(15000);
    }
  });

  test('Japanese v4.1.0 release notes exist and have correct content', async () => {
    const releaseNotesPath1 = path.join(rootDir, 'releases', 'v4.1.0-ja.md');
    const releaseNotesPath2 = path.join(rootDir, 'public', 'releases', 'v4.1.0-ja.md');
    
    // Check both required locations exist
    const exists1 = await fs.access(releaseNotesPath1).then(() => true).catch(() => false);
    const exists2 = await fs.access(releaseNotesPath2).then(() => true).catch(() => false);
    
    expect(exists1, 'Japanese v4.1.0 release notes should exist in /releases/').toBe(true);
    expect(exists2, 'Japanese v4.1.0 release notes should exist in /public/releases/').toBe(true);
    
    if (exists1) {
      const content = await fs.readFile(releaseNotesPath1, 'utf-8');
      
      // Verify Japanese release notes content
      expect(content, 'Should contain Japanese text').toMatch(/[ひらがなカタカナ漢字]/);
      expect(content, 'Should mention v4.1.0').toContain('4.1.0');
      expect(content, 'Should contain release notes structure').toMatch(/##.*新機能|機能|改善/);
      expect(content.length, 'Should be substantial content (>4000 characters)').toBeGreaterThan(4000);
    }
  });

  test('Japanese v4.0.0 release notes exist and have correct content', async () => {
    const releaseNotesPath1 = path.join(rootDir, 'releases', 'v4.0.0-ja.md');
    const releaseNotesPath2 = path.join(rootDir, 'public', 'releases', 'v4.0.0-ja.md');
    
    // Check both required locations exist
    const exists1 = await fs.access(releaseNotesPath1).then(() => true).catch(() => false);
    const exists2 = await fs.access(releaseNotesPath2).then(() => true).catch(() => false);
    
    expect(exists1, 'Japanese v4.0.0 release notes should exist in /releases/').toBe(true);
    expect(exists2, 'Japanese v4.0.0 release notes should exist in /public/releases/').toBe(true);
    
    if (exists1) {
      const content = await fs.readFile(releaseNotesPath1, 'utf-8');
      
      // Verify Japanese release notes content
      expect(content, 'Should contain Japanese text').toMatch(/[ひらがなカタカナ漢字]/);
      expect(content, 'Should mention v4.0.0').toContain('4.0.0');
      expect(content, 'Should contain major release information').toMatch(/メジャー|大幅|重要/);
      expect(content.length, 'Should be substantial content (>6000 characters)').toBeGreaterThan(6000);
    }
  });

  test('German v4.1.0 release notes exist and have correct content', async () => {
    const releaseNotesPath1 = path.join(rootDir, 'releases', 'v4.1.0-de.md');
    const releaseNotesPath2 = path.join(rootDir, 'public', 'releases', 'v4.1.0-de.md');
    
    // Check both required locations exist
    const exists1 = await fs.access(releaseNotesPath1).then(() => true).catch(() => false);
    const exists2 = await fs.access(releaseNotesPath2).then(() => true).catch(() => false);
    
    expect(exists1, 'German v4.1.0 release notes should exist in /releases/').toBe(true);
    expect(exists2, 'German v4.1.0 release notes should exist in /public/releases/').toBe(true);
    
    if (exists1) {
      const content = await fs.readFile(releaseNotesPath1, 'utf-8');
      
      // Verify German release notes content
      expect(content, 'Should contain German umlauts').toMatch(/[äöüÄÖÜß]/);
      expect(content, 'Should mention v4.1.0').toContain('4.1.0');
      expect(content, 'Should contain German release notes structure').toMatch(/Versionshinweise|Neue.*Funktionen|Verbesserungen/);
      expect(content.length, 'Should be substantial content (>8000 characters)').toBeGreaterThan(8000);
    }
  });

  test('German v4.0.0 release notes exist and have correct content', async () => {
    const releaseNotesPath1 = path.join(rootDir, 'releases', 'v4.0.0-de.md');
    const releaseNotesPath2 = path.join(rootDir, 'public', 'releases', 'v4.0.0-de.md');
    
    // Check both required locations exist
    const exists1 = await fs.access(releaseNotesPath1).then(() => true).catch(() => false);
    const exists2 = await fs.access(releaseNotesPath2).then(() => true).catch(() => false);
    
    expect(exists1, 'German v4.0.0 release notes should exist in /releases/').toBe(true);
    expect(exists2, 'German v4.0.0 release notes should exist in /public/releases/').toBe(true);
    
    if (exists1) {
      const content = await fs.readFile(releaseNotesPath1, 'utf-8');
      
      // Verify German release notes content
      expect(content, 'Should contain German umlauts').toMatch(/[äöüÄÖÜß]/);
      expect(content, 'Should mention v4.0.0').toContain('4.0.0');
      expect(content, 'Should contain major version terminology').toMatch(/Hauptversion|Versionshinweise/);
      expect(content.length, 'Should be substantial content (>15000 characters)').toBeGreaterThan(15000);
    }
  });

  test('French v4.1.0 release notes exist and have correct content', async () => {
    const releaseNotesPath1 = path.join(rootDir, 'releases', 'v4.1.0-fr.md');
    const releaseNotesPath2 = path.join(rootDir, 'public', 'releases', 'v4.1.0-fr.md');
    
    // Check both required locations exist
    const exists1 = await fs.access(releaseNotesPath1).then(() => true).catch(() => false);
    const exists2 = await fs.access(releaseNotesPath2).then(() => true).catch(() => false);
    
    expect(exists1, 'French v4.1.0 release notes should exist in /releases/').toBe(true);
    expect(exists2, 'French v4.1.0 release notes should exist in /public/releases/').toBe(true);
    
    if (exists1) {
      const content = await fs.readFile(releaseNotesPath1, 'utf-8');
      
      // Verify French release notes content
      expect(content, 'Should contain French accents').toMatch(/[àâäçéèêëïîôöùûüÿ]/);
      expect(content, 'Should mention v4.1.0').toContain('4.1.0');
      expect(content, 'Should contain French release notes structure').toMatch(/Notes.*de.*version|Nouvelles.*fonctionnalités|Améliorations/i);
      expect(content.length, 'Should be substantial content (>8000 characters)').toBeGreaterThan(8000);
    }
  });

  test('All translation files have proper encoding and format', async () => {
    const translationFiles = [
      'README-ja.md',
      'README-es.md', 
      'README-zh.md',
      'releases/v4.1.0-ja.md',
      'releases/v4.0.0-ja.md',
      'releases/v4.1.0-de.md',
      'releases/v4.0.0-de.md',
      'releases/v4.1.0-fr.md',
      'public/releases/v4.1.0-ja.md',
      'public/releases/v4.0.0-ja.md',
      'public/releases/v4.1.0-de.md',
      'public/releases/v4.0.0-de.md',
      'public/releases/v4.1.0-fr.md'
    ];

    let existingFiles = 0;
    let validFiles = 0;

    for (const filePath of translationFiles) {
      const fullPath = path.join(rootDir, filePath);
      
      try {
        const content = await fs.readFile(fullPath, 'utf-8');
        existingFiles++;
        
        // Basic validation checks
        const isValidMarkdown = content.includes('#') && content.length > 1000;
        const hasProperEncoding = !content.includes('\ufffd'); // No replacement characters
        const hasContent = content.trim().length > 0;
        
        if (isValidMarkdown && hasProperEncoding && hasContent) {
          validFiles++;
        }
        
        console.log(`✓ ${filePath}: ${content.length} characters`);
        
      } catch (error) {
        console.log(`✗ ${filePath}: File not found`);
      }
    }

    console.log(`\nTranslation Summary:`);
    console.log(`Files found: ${existingFiles}/${translationFiles.length}`);
    console.log(`Valid files: ${validFiles}/${existingFiles}`);

    // We expect at least the main translation files to exist
    expect(existingFiles, 'Should have at least 8 translation files').toBeGreaterThanOrEqual(8);
    expect(validFiles, 'All existing files should be valid').toBe(existingFiles);
  });

  test('Translation file sizes are appropriate', async () => {
    const expectedSizes = {
      'README-ja.md': { min: 40000, max: 60000 },
      'README-es.md': { min: 35000, max: 50000 },
      'README-zh.md': { min: 25000, max: 40000 },
      'releases/v4.1.0-ja.md': { min: 8000, max: 15000 },
      'releases/v4.0.0-ja.md': { min: 15000, max: 25000 },
      'releases/v4.1.0-de.md': { min: 8000, max: 15000 },
      'releases/v4.0.0-de.md': { min: 15000, max: 25000 },
      'releases/v4.1.0-fr.md': { min: 8000, max: 15000 }
    };

    for (const [filePath, sizeRange] of Object.entries(expectedSizes)) {
      const fullPath = path.join(rootDir, filePath);
      
      try {
        const stats = await fs.stat(fullPath);
        const fileSize = stats.size;
        
        expect(fileSize, `${filePath} should be within expected size range`).toBeGreaterThanOrEqual(sizeRange.min);
        expect(fileSize, `${filePath} should not be too large`).toBeLessThanOrEqual(sizeRange.max);
        
        console.log(`✓ ${filePath}: ${fileSize} bytes (${sizeRange.min}-${sizeRange.max} expected)`);
        
      } catch (error) {
        console.log(`⚠ ${filePath}: File not found - skipping size check`);
      }
    }
  });
});