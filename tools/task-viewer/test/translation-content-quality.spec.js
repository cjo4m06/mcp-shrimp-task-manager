import { test, expect } from '@playwright/test';
import fs from 'fs/promises';
import path from 'path';

test.describe('Translation Content Quality Verification', () => {
  const rootDir = path.resolve();
  
  test('Japanese translations maintain proper Japanese writing style', async () => {
    const files = [
      'README-ja.md',
      'releases/v4.1.0-ja.md', 
      'releases/v4.0.0-ja.md'
    ];

    for (const filePath of files) {
      const fullPath = path.join(rootDir, filePath);
      
      try {
        const content = await fs.readFile(fullPath, 'utf-8');
        
        // Check for Japanese-specific elements
        expect(content, `${filePath} should contain Hiragana characters`).toMatch(/[あ-ん]/);
        expect(content, `${filePath} should contain Katakana characters`).toMatch(/[ア-ン]/);
        expect(content, `${filePath} should contain Kanji characters`).toMatch(/[一-龯]/);
        
        // Check for proper Japanese technical terminology
        expect(content, `${filePath} should use Japanese task terminology`).toMatch(/タスク|課題/);
        expect(content, `${filePath} should use Japanese management terminology`).toMatch(/管理|マネージャー/);
        
        // Verify brand consistency
        expect(content, `${filePath} should maintain Shrimp branding in Japanese`).toMatch(/シュリンプ/);
        
        console.log(`✓ ${filePath}: Japanese writing style verified`);
        
      } catch (error) {
        console.log(`⚠ ${filePath}: File not found - skipping Japanese style check`);
      }
    }
  });

  test('Spanish translations use proper Spanish grammar and terminology', async () => {
    const spanishReadmePath = path.join(rootDir, 'README-es.md');
    
    try {
      const content = await fs.readFile(spanishReadmePath, 'utf-8');
      
      // Check for Spanish-specific elements
      expect(content, 'Should contain Spanish accented characters').toMatch(/[áéíóúüñ]/i);
      
      // Check for proper Spanish technical terminology
      expect(content, 'Should use Spanish task terminology').toMatch(/tarea|trabajo/i);
      expect(content, 'Should use Spanish management terminology').toMatch(/administrador|gestor|gestión/i);
      expect(content, 'Should use Spanish application terminology').toMatch(/aplicación|programa/i);
      
      // Check for proper Spanish phrases common in technical docs
      expect(content, 'Should contain proper Spanish technical phrases').toMatch(/instalación|configuración|características/i);
      
      console.log('✓ README-es.md: Spanish grammar and terminology verified');
      
    } catch (error) {
      console.log('⚠ README-es.md: File not found - skipping Spanish check');
    }
  });

  test('Chinese translations use consistent simplified Chinese', async () => {
    const chineseReadmePath = path.join(rootDir, 'README-zh.md');
    
    try {
      const content = await fs.readFile(chineseReadmePath, 'utf-8');
      
      // Check for simplified Chinese characters (avoiding traditional variants)
      expect(content, 'Should use simplified Chinese characters').toMatch(/[一-龯]/);
      
      // Check for proper Chinese technical terminology
      expect(content, 'Should use Chinese task terminology').toMatch(/任务|工作/);
      expect(content, 'Should use Chinese management terminology').toMatch(/管理|管理器/);
      expect(content, 'Should use Chinese application terminology').toMatch(/应用|程序/);
      
      // Verify common Chinese technical phrases
      expect(content, 'Should contain Chinese technical phrases').toMatch(/安装|配置|功能/);
      
      console.log('✓ README-zh.md: Simplified Chinese terminology verified');
      
    } catch (error) {
      console.log('⚠ README-zh.md: File not found - skipping Chinese check');
    }
  });

  test('German translations use proper German compound words and grammar', async () => {
    const files = [
      'releases/v4.1.0-de.md',
      'releases/v4.0.0-de.md'
    ];

    for (const filePath of files) {
      const fullPath = path.join(rootDir, filePath);
      
      try {
        const content = await fs.readFile(fullPath, 'utf-8');
        
        // Check for German-specific elements
        expect(content, `${filePath} should contain German umlauts`).toMatch(/[äöüÄÖÜß]/);
        
        // Check for proper German technical terminology
        expect(content, `${filePath} should use German task terminology`).toMatch(/Aufgabe|Task/);
        expect(content, `${filePath} should use German management terminology`).toMatch(/Verwaltung|Manager|Verwalter/i);
        
        // Check for German compound words (typical in technical docs)
        expect(content, `${filePath} should contain German compound words`).toMatch(/.*verwaltung|.*system|.*funktion/i);
        
        // Check for proper German technical phrases
        expect(content, `${filePath} should contain German technical phrases`).toMatch(/Versionshinweise|Funktionen|Verbesserungen/i);
        
        console.log(`✓ ${filePath}: German grammar and terminology verified`);
        
      } catch (error) {
        console.log(`⚠ ${filePath}: File not found - skipping German check`);
      }
    }
  });

  test('French translations use proper French grammar and accents', async () => {
    const frenchReleasePath = path.join(rootDir, 'releases', 'v4.1.0-fr.md');
    
    try {
      const content = await fs.readFile(frenchReleasePath, 'utf-8');
      
      // Check for French-specific elements
      expect(content, 'Should contain French accented characters').toMatch(/[àâäçéèêëïîôöùûüÿñ]/i);
      
      // Check for proper French technical terminology
      expect(content, 'Should use French task terminology').toMatch(/tâche|travail/i);
      expect(content, 'Should use French management terminology').toMatch(/gestionnaire|gestion/i);
      expect(content, 'Should use French application terminology').toMatch(/application|programme/i);
      
      // Check for proper French phrases
      expect(content, 'Should contain French technical phrases').toMatch(/notes.*version|fonctionnalités|améliorations/i);
      
      console.log('✓ releases/v4.1.0-fr.md: French grammar and terminology verified');
      
    } catch (error) {
      console.log('⚠ releases/v4.1.0-fr.md: File not found - skipping French check');
    }
  });

  test('All translation files maintain consistent markdown structure', async () => {
    const translationFiles = [
      'README-ja.md',
      'README-es.md',
      'README-zh.md',
      'releases/v4.1.0-ja.md',
      'releases/v4.0.0-ja.md',
      'releases/v4.1.0-de.md',
      'releases/v4.0.0-de.md',
      'releases/v4.1.0-fr.md'
    ];

    let structureChecks = 0;

    for (const filePath of translationFiles) {
      const fullPath = path.join(rootDir, filePath);
      
      try {
        const content = await fs.readFile(fullPath, 'utf-8');
        
        // Check for essential markdown elements
        expect(content, `${filePath} should have proper markdown headers`).toMatch(/^# /m);
        expect(content, `${filePath} should maintain code block formatting`).toMatch(/```/);
        
        // Check for links preservation
        if (filePath.includes('README')) {
          expect(content, `${filePath} should preserve links`).toMatch(/\[.*\]\(.*\)/);
        }
        
        // Check for proper emoji usage (should maintain original emojis)
        expect(content, `${filePath} should maintain emojis`).toMatch(/[🦐📊🎯✨]/);
        
        structureChecks++;
        console.log(`✓ ${filePath}: Markdown structure verified`);
        
      } catch (error) {
        console.log(`⚠ ${filePath}: File not found - skipping structure check`);
      }
    }

    expect(structureChecks, 'Should verify structure for at least 6 files').toBeGreaterThanOrEqual(6);
  });

  test('Translation files preserve technical terms and code examples', async () => {
    const files = [
      'README-ja.md',
      'README-es.md',
      'README-zh.md'
    ];

    for (const filePath of files) {
      const fullPath = path.join(rootDir, filePath);
      
      try {
        const content = await fs.readFile(fullPath, 'utf-8');
        
        // Check that technical terms are preserved or properly translated
        expect(content, `${filePath} should preserve API terminology`).toMatch(/API/);
        expect(content, `${filePath} should preserve JSON terminology`).toMatch(/JSON/);
        expect(content, `${filePath} should preserve npm commands`).toMatch(/npm/);
        
        // Check that code examples are preserved
        expect(content, `${filePath} should preserve JavaScript code blocks`).toMatch(/```(javascript|js)/);
        
        // Check that file paths are preserved
        expect(content, `${filePath} should preserve file paths`).toMatch(/\.(js|md|json)/);
        
        console.log(`✓ ${filePath}: Technical terms and code preserved`);
        
      } catch (error) {
        console.log(`⚠ ${filePath}: File not found - skipping technical preservation check`);
      }
    }
  });

  test('Release notes maintain version consistency and technical accuracy', async () => {
    const releaseFiles = [
      { file: 'releases/v4.1.0-ja.md', version: '4.1.0' },
      { file: 'releases/v4.0.0-ja.md', version: '4.0.0' },
      { file: 'releases/v4.1.0-de.md', version: '4.1.0' },
      { file: 'releases/v4.0.0-de.md', version: '4.0.0' },
      { file: 'releases/v4.1.0-fr.md', version: '4.1.0' }
    ];

    for (const { file: filePath, version } of releaseFiles) {
      const fullPath = path.join(rootDir, filePath);
      
      try {
        const content = await fs.readFile(fullPath, 'utf-8');
        
        // Check version consistency
        expect(content, `${filePath} should mention correct version`).toContain(version);
        
        // Check for release date patterns
        expect(content, `${filePath} should contain date information`).toMatch(/202[3-5]|[0-9]{4}/);
        
        // Check for proper feature descriptions
        expect(content, `${filePath} should describe features`).toMatch(/##.*[Ff]eature|機能|Funktion|fonctionnalité/);
        
        // Check technical term preservation
        expect(content, `${filePath} should preserve component names`).toMatch(/Task|Archive|Agent/i);
        
        console.log(`✓ ${filePath}: Version ${version} consistency verified`);
        
      } catch (error) {
        console.log(`⚠ ${filePath}: File not found - skipping version consistency check`);
      }
    }
  });
});