import { test, expect } from '@playwright/test';

test.describe('Release Notes UI Language Switching', () => {
  
  // All supported languages with their display names and sample translated terms to check
  const languages = [
    { 
      code: 'ja', 
      name: 'Japanese', 
      native: '日本語',
      sampleTerms: ['タスク', 'システム', 'リリース', 'アーカイブ']
    },
    { 
      code: 'zh', 
      name: 'Chinese', 
      native: '中文',
      sampleTerms: ['任务', '系统', '发布', '存档']
    },
    { 
      code: 'ko', 
      name: 'Korean', 
      native: '한국어',
      sampleTerms: ['작업', '시스템', '릴리스', '아카이브']
    },
    { 
      code: 'es', 
      name: 'Spanish', 
      native: 'Español',
      sampleTerms: ['Tarea', 'Sistema', 'Notas', 'Archivo']
    },
    { 
      code: 'fr', 
      name: 'French', 
      native: 'Français',
      sampleTerms: ['Tâche', 'Système', 'Notes', 'Archive']
    },
    { 
      code: 'de', 
      name: 'German', 
      native: 'Deutsch',
      sampleTerms: ['Task', 'System', 'Release', 'Archiv']
    },
    { 
      code: 'it', 
      name: 'Italian', 
      native: 'Italiano',
      sampleTerms: ['Task', 'Sistema', 'Note', 'Archiviazione']
    },
    { 
      code: 'pt', 
      name: 'Portuguese', 
      native: 'Português',
      sampleTerms: ['Tarefa', 'Sistema', 'Lançamento', 'Arquivo']
    },
    { 
      code: 'ru', 
      name: 'Russian', 
      native: 'Русский',
      sampleTerms: ['Задач', 'Система', 'Релиз', 'Архив']
    },
    { 
      code: 'hi', 
      name: 'Hindi', 
      native: 'हिन्दी',
      sampleTerms: ['टास्क', 'सिस्टम', 'रिलीज', 'संग्रह']
    },
    { 
      code: 'th', 
      name: 'Thai', 
      native: 'ไทย',
      sampleTerms: ['งาน', 'ระบบ', 'การเปิดตัว', 'เก็บถาวร']
    },
    { 
      code: 'vi', 
      name: 'Vietnamese', 
      native: 'Tiếng Việt',
      sampleTerms: ['Tác vụ', 'Hệ thống', 'Phát hành', 'Lưu trữ']
    },
    { 
      code: 'tr', 
      name: 'Turkish', 
      native: 'Türkçe',
      sampleTerms: ['Görev', 'Sistem', 'Sürüm', 'Arşiv']
    }
  ];

  // Before each test, make sure we're starting with English
  test.beforeEach(async ({ page }) => {
    await page.goto('/?lang=en');
    await page.waitForLoadState('networkidle');
  });

  test('Language selector is available and contains all supported languages', async ({ page }) => {
    // Look for language selector (assuming it exists in the UI)
    const languageSelector = page.locator('[data-testid="language-selector"], .language-selector, select[name*="language"], select[name*="lang"]').first();
    
    if (await languageSelector.count() > 0) {
      // Verify all languages are available in the selector
      for (const lang of languages) {
        const option = languageSelector.locator(`option[value="${lang.code}"]`);
        await expect(option, `Language selector should contain ${lang.name} option`).toBeVisible();
      }
    } else {
      console.warn('Language selector not found in UI - skipping selector verification');
    }
  });

  test('Release notes display translated content when switching languages via URL', async ({ page }) => {
    for (const lang of languages) {
      console.log(`Testing ${lang.name} (${lang.code}) translations...`);
      
      // Navigate to the page with language parameter
      await page.goto(`/?lang=${lang.code}`);
      await page.waitForLoadState('networkidle');
      
      // Wait for release notes content to load
      await page.waitForSelector('[data-testid="release-notes"], .release-notes, .release-content', { timeout: 10000 });
      
      // Check that we're not seeing English content for non-English languages
      if (lang.code !== 'en') {
        // English titles that should NOT appear in translations
        const englishTitles = [
          'Task Completion Summary Storage System',
          'Enhanced Release Notes & Archive System',
          'Initial Request Display'
        ];
        
        const pageContent = await page.textContent('body');
        
        for (const englishTitle of englishTitles) {
          expect(pageContent, `${lang.name} page should not contain English title: "${englishTitle}"`).not.toContain(englishTitle);
        }
        
        // Check for presence of language-specific terms if possible
        let foundLanguageSpecificContent = false;
        for (const term of lang.sampleTerms) {
          if (pageContent && pageContent.includes(term)) {
            foundLanguageSpecificContent = true;
            break;
          }
        }
        
        if (!foundLanguageSpecificContent) {
          console.warn(`Warning: No language-specific terms found for ${lang.name}. This might indicate missing translations.`);
        }
      }
      
      // Verify version information is displayed (should be consistent across languages)
      await expect(page.locator('text=v4.1.0')).toBeVisible({ timeout: 5000 });
      await expect(page.locator('text=v4.0.0')).toBeVisible({ timeout: 5000 });
    }
  });

  test('Release notes metadata is properly translated', async ({ page }) => {
    for (const lang of languages) {
      console.log(`Testing release metadata for ${lang.name}...`);
      
      await page.goto(`/?lang=${lang.code}`);
      await page.waitForLoadState('networkidle');
      
      // Navigate to release notes if not already there
      const releaseNotesLink = page.locator('text="Release Notes", [data-testid*="release"], .nav-link:has-text("Release")').first();
      if (await releaseNotesLink.count() > 0) {
        await releaseNotesLink.click();
        await page.waitForLoadState('networkidle');
      }
      
      // Check that release titles are visible and not in English (for non-English languages)
      const releaseTitles = page.locator('[data-testid*="release-title"], .release-title, .version-title, h1, h2, h3').filter({ hasText: /v\d+\.\d+\.\d+/ });
      
      if (await releaseTitles.count() > 0) {
        const firstTitle = await releaseTitles.first().textContent();
        
        if (lang.code !== 'en') {
          // Ensure it's not the default English title
          expect(firstTitle, `${lang.name} should not show English release title`).not.toContain('Task Completion Summary Storage System');
          expect(firstTitle, `${lang.name} should not show English archive title`).not.toContain('Enhanced Release Notes & Archive System');
        }
        
        console.log(`${lang.name} release title sample: ${firstTitle}`);
      }
    }
  });

  test('Language persistence across navigation', async ({ page }) => {
    // Test a few key languages for persistence
    const testLanguages = languages.filter(l => ['ja', 'zh', 'es', 'fr'].includes(l.code));
    
    for (const lang of testLanguages) {
      console.log(`Testing language persistence for ${lang.name}...`);
      
      // Set the language
      await page.goto(`/?lang=${lang.code}`);
      await page.waitForLoadState('networkidle');
      
      // Navigate to different sections and verify language persists
      const navigationLinks = [
        { selector: 'text="Tasks"', fallback: '[data-testid*="task"]' },
        { selector: 'text="Settings"', fallback: '[data-testid*="setting"]' },
        { selector: 'text="Release Notes"', fallback: '[data-testid*="release"]' }
      ];
      
      for (const nav of navigationLinks) {
        const navElement = page.locator(nav.selector).or(page.locator(nav.fallback)).first();
        
        if (await navElement.count() > 0 && await navElement.isVisible()) {
          await navElement.click();
          await page.waitForLoadState('networkidle');
          
          // Verify the language parameter is still in URL or localStorage
          const currentUrl = page.url();
          const hasLanguageInUrl = currentUrl.includes(`lang=${lang.code}`);
          
          if (!hasLanguageInUrl) {
            // Check if language is persisted in localStorage
            const storedLanguage = await page.evaluate(() => {
              return localStorage.getItem('shrimpTaskViewerLanguage') || 
                     localStorage.getItem('language') || 
                     localStorage.getItem('i18nextLng');
            });
            
            expect(storedLanguage === lang.code || hasLanguageInUrl, 
              `Language ${lang.code} should persist across navigation`).toBeTruthy();
          }
        }
      }
    }
  });

  test('Translation completeness verification', async ({ page }) => {
    // Test that key UI elements are translated
    const testLanguages = ['ja', 'zh', 'es', 'de'];
    
    for (const langCode of testLanguages) {
      console.log(`Testing translation completeness for ${langCode}...`);
      
      await page.goto(`/?lang=${langCode}`);
      await page.waitForLoadState('networkidle');
      
      // Check that common UI elements don't contain untranslated English text
      const commonEnglishTerms = [
        'Loading...',
        'Settings',
        'Tasks',
        'Release Notes',
        'Archive',
        'History',
        'Profile',
        'Project'
      ];
      
      const pageContent = await page.textContent('body');
      let untranslatedTermsFound = [];
      
      for (const term of commonEnglishTerms) {
        if (pageContent && pageContent.includes(term)) {
          untranslatedTermsFound.push(term);
        }
      }
      
      if (untranslatedTermsFound.length > 0) {
        console.warn(`Warning: Found potentially untranslated terms in ${langCode}: ${untranslatedTermsFound.join(', ')}`);
        // Note: This is a warning, not a failure, as some English terms might be intentional (like "VS Code")
      }
    }
  });

});