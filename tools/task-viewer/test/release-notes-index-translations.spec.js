import { test, expect } from '@playwright/test';
import fs from 'fs/promises';
import path from 'path';

test.describe('Release Notes Index Translations', () => {
  const rootDir = path.resolve();
  
  // All supported languages from i18n configuration
  const languages = [
    { code: 'en', name: 'English', native: 'English' },
    { code: 'ja', name: 'Japanese', native: '日本語' },
    { code: 'zh', name: 'Chinese', native: '中文' },
    { code: 'ko', name: 'Korean', native: '한국어' },
    { code: 'es', name: 'Spanish', native: 'Español' },
    { code: 'fr', name: 'French', native: 'Français' },
    { code: 'de', name: 'German', native: 'Deutsch' },
    { code: 'it', name: 'Italian', native: 'Italiano' },
    { code: 'pt', name: 'Portuguese', native: 'Português' },
    { code: 'ru', name: 'Russian', native: 'Русский' },
    { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
    { code: 'th', name: 'Thai', native: 'ไทย' },
    { code: 'vi', name: 'Vietnamese', native: 'Tiếng Việt' },
    { code: 'tr', name: 'Turkish', native: 'Türkçe' }
  ];

  // Expected release versions that should be translated
  const expectedVersions = ['v4.1.0', 'v4.0.0', 'v3.1.0', 'v3.0.0', 'v2.1.0', 'v2.0.0'];

  test('All language translation index files exist', async () => {
    for (const lang of languages) {
      if (lang.code === 'en') continue; // Skip English as it's the original

      const indexPath = path.join(rootDir, 'src/data/releases', `index-${lang.code}.js`);
      const fileExists = await fs.access(indexPath).then(() => true).catch(() => false);
      
      expect(fileExists, `Translation index file should exist for ${lang.name} (${lang.code})`).toBe(true);
    }
  });

  test('All translation index files have correct structure', async () => {
    for (const lang of languages) {
      if (lang.code === 'en') continue; // Skip English as it's the original

      const indexPath = path.join(rootDir, 'src/data/releases', `index-${lang.code}.js`);
      
      try {
        const content = await fs.readFile(indexPath, 'utf-8');
        
        // Check for required exports
        expect(content, `${lang.name} index should export releaseMetadata`).toContain('export const releaseMetadata');
        expect(content, `${lang.name} index should export getLatestVersion`).toContain('export const getLatestVersion');
        expect(content, `${lang.name} index should export getReleaseFile`).toContain('export const getReleaseFile');
        
        // Check for all expected version entries
        for (const version of expectedVersions) {
          expect(content, `${lang.name} index should contain ${version}`).toContain(`version: '${version}'`);
        }
        
        // Check for date fields (should be unchanged)
        expect(content, `${lang.name} index should contain date fields`).toContain('date:');
        expect(content, `${lang.name} index should contain title fields`).toContain('title:');
        expect(content, `${lang.name} index should contain summary fields`).toContain('summary:');
        
      } catch (error) {
        throw new Error(`Failed to read or validate ${lang.name} translation index: ${error.message}`);
      }
    }
  });

  test('Translation files contain properly translated content (not English)', async () => {
    // Sample English titles to check they are NOT present in translations
    const englishTitles = [
      'Task Completion Summary Storage System',
      'Enhanced Release Notes & Archive System',
      'Initial Request Display',
      'Internationalization, Task History, Sub-agents, Lightbox',
      'Enhanced Task Management & VS Code Integration',
      'Initial Standalone Release'
    ];

    for (const lang of languages) {
      if (lang.code === 'en') continue; // Skip English as it's the original

      const indexPath = path.join(rootDir, 'src/data/releases', `index-${lang.code}.js`);
      const content = await fs.readFile(indexPath, 'utf-8');
      
      // Ensure English titles are NOT present (indicating proper translation)
      for (const englishTitle of englishTitles) {
        expect(content, `${lang.name} translation should not contain English title: "${englishTitle}"`).not.toContain(englishTitle);
      }
      
      // Check that titles and summaries are actually translated (not just empty)
      const titleMatches = content.match(/title: ['"`]([^'"`]+)['"`]/g);
      const summaryMatches = content.match(/summary: ['"`]([^'"`]+)['"`]/g);
      
      expect(titleMatches?.length, `${lang.name} should have ${expectedVersions.length} translated titles`).toBe(expectedVersions.length);
      expect(summaryMatches?.length, `${lang.name} should have ${expectedVersions.length} translated summaries`).toBe(expectedVersions.length);
      
      // Verify translations are not empty
      for (const match of titleMatches || []) {
        const titleContent = match.match(/title: ['"`]([^'"`]+)['"`]/)[1];
        expect(titleContent.length, `${lang.name} title should not be empty`).toBeGreaterThan(5);
      }
    }
  });

  test('Language-specific character verification', async () => {
    const languageCharacterChecks = {
      'ja': {
        pattern: /[ひらがなカタカナ漢字]/,
        description: 'Japanese characters (hiragana, katakana, kanji)'
      },
      'zh': {
        pattern: /[\u4e00-\u9fff]/,
        description: 'Chinese characters'
      },
      'ko': {
        pattern: /[가-힣]/,
        description: 'Korean characters'
      },
      'ru': {
        pattern: /[а-яё]/i,
        description: 'Cyrillic characters'
      },
      'hi': {
        pattern: /[\u0900-\u097f]/,
        description: 'Devanagari characters'
      },
      'th': {
        pattern: /[\u0e00-\u0e7f]/,
        description: 'Thai characters'
      }
    };

    for (const [langCode, check] of Object.entries(languageCharacterChecks)) {
      const indexPath = path.join(rootDir, 'src/data/releases', `index-${langCode}.js`);
      const content = await fs.readFile(indexPath, 'utf-8');
      
      expect(content, `${langCode} translation should contain ${check.description}`).toMatch(check.pattern);
    }
  });

  test('Version dates are preserved correctly', async () => {
    const expectedDates = {
      'v4.1.0': '2025-09-06',
      'v4.0.0': '2025-09-03', 
      'v3.1.0': '2025-08-31',
      'v3.0.0': '2025-08-01',
      'v2.1.0': '2025-07-29',
      'v2.0.0': '2025-07-27'
    };

    for (const lang of languages) {
      if (lang.code === 'en') continue;

      const indexPath = path.join(rootDir, 'src/data/releases', `index-${lang.code}.js`);
      const content = await fs.readFile(indexPath, 'utf-8');
      
      for (const [version, expectedDate] of Object.entries(expectedDates)) {
        expect(content, `${lang.name} should have correct date for ${version}`).toContain(`date: '${expectedDate}'`);
      }
    }
  });

  test('Translation files can be imported as valid JavaScript modules', async () => {
    for (const lang of languages) {
      if (lang.code === 'en') continue;

      const indexPath = path.join(rootDir, 'src/data/releases', `index-${lang.code}.js`);
      
      try {
        // Test that the file is valid JavaScript by importing it
        const module = await import(`file://${indexPath}`);
        
        expect(module.releaseMetadata, `${lang.name} should export releaseMetadata array`).toBeInstanceOf(Array);
        expect(module.releaseMetadata.length, `${lang.name} should have ${expectedVersions.length} releases`).toBe(expectedVersions.length);
        expect(typeof module.getLatestVersion, `${lang.name} should export getLatestVersion function`).toBe('function');
        expect(typeof module.getReleaseFile, `${lang.name} should export getReleaseFile function`).toBe('function');
        
        // Test that getLatestVersion returns the expected version
        const latestVersion = module.getLatestVersion();
        expect(latestVersion.version, `${lang.name} latest version should be v4.1.0`).toBe('v4.1.0');
        
        // Test that getReleaseFile returns expected format
        const releaseFile = module.getReleaseFile('v4.0.0');
        expect(releaseFile, `${lang.name} getReleaseFile should return correct path`).toBe('/releases/v4.0.0.md');
        
      } catch (error) {
        throw new Error(`${lang.name} translation index file has JavaScript syntax error: ${error.message}`);
      }
    }
  });

});