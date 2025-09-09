import { test, expect } from '@playwright/test';

test.describe('Translation Integration Readiness', () => {
  
  const languages = ['ja', 'zh', 'ko', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'hi', 'th', 'vi', 'tr'];

  test('All translation index files can be dynamically imported and used', async () => {
    console.log('Testing dynamic import capability for all translation files...');
    
    const results = {};
    
    for (const lang of languages) {
      try {
        // Dynamic import of translation file
        const module = await import(`../src/data/releases/index-${lang}.js`);
        
        // Verify structure
        expect(module.releaseMetadata, `${lang} should export releaseMetadata`).toBeDefined();
        expect(Array.isArray(module.releaseMetadata), `${lang} releaseMetadata should be array`).toBe(true);
        expect(module.releaseMetadata.length, `${lang} should have 6 releases`).toBe(6);
        expect(typeof module.getLatestVersion, `${lang} should export getLatestVersion function`).toBe('function');
        expect(typeof module.getReleaseFile, `${lang} should export getReleaseFile function`).toBe('function');
        
        // Test functionality
        const latest = module.getLatestVersion();
        expect(latest.version, `${lang} latest should be v4.1.0`).toBe('v4.1.0');
        expect(latest.title, `${lang} latest should have translated title`).toBeTruthy();
        expect(latest.title.length, `${lang} title should not be empty`).toBeGreaterThan(0);
        
        const releaseFile = module.getReleaseFile('v4.0.0');
        expect(releaseFile, `${lang} getReleaseFile should work`).toBe('/releases/v4.0.0.md');
        
        results[lang] = {
          status: 'success',
          titleSample: latest.title,
          summarySample: latest.summary.substring(0, 50) + '...'
        };
        
      } catch (error) {
        results[lang] = {
          status: 'error',
          error: error.message
        };
      }
    }
    
    // Log results summary
    console.log('Translation Integration Test Results:');
    console.log('=====================================');
    
    let successCount = 0;
    for (const [lang, result] of Object.entries(results)) {
      if (result.status === 'success') {
        successCount++;
        console.log(`✅ ${lang}: ${result.titleSample}`);
      } else {
        console.log(`❌ ${lang}: ${result.error}`);
        throw new Error(`Translation file ${lang} failed: ${result.error}`);
      }
    }
    
    console.log(`\n🎉 Successfully tested ${successCount}/${languages.length} translation files!`);
    expect(successCount, 'All translation files should work correctly').toBe(languages.length);
  });

  test('Translation files produce unique content per language', async () => {
    console.log('Verifying translations are unique and not duplicates...');
    
    const titleSets = new Map();
    const summarySets = new Map();
    
    for (const lang of languages) {
      const module = await import(`../src/data/releases/index-${lang}.js`);
      const releases = module.releaseMetadata;
      
      // Extract all titles and summaries for this language
      const titles = releases.map(r => r.title).join('|');
      const summaries = releases.map(r => r.summary).join('|');
      
      // Check for duplicates
      if (titleSets.has(titles)) {
        throw new Error(`Duplicate titles detected: ${lang} has same titles as ${titleSets.get(titles)}`);
      }
      if (summarySets.has(summaries)) {
        throw new Error(`Duplicate summaries detected: ${lang} has same summaries as ${summarySets.get(summaries)}`);
      }
      
      titleSets.set(titles, lang);
      summarySets.set(summaries, lang);
    }
    
    console.log(`✅ All ${languages.length} languages have unique translations`);
  });

  test('Translation files maintain version consistency', async () => {
    console.log('Verifying version and date consistency across all languages...');
    
    const expectedVersions = ['v4.1.0', 'v4.0.0', 'v3.1.0', 'v3.0.0', 'v2.1.0', 'v2.0.0'];
    const expectedDates = ['2025-09-06', '2025-09-03', '2025-08-31', '2025-08-01', '2025-07-29', '2025-07-27'];
    
    for (const lang of languages) {
      const module = await import(`../src/data/releases/index-${lang}.js`);
      const releases = module.releaseMetadata;
      
      // Check versions
      const versions = releases.map(r => r.version);
      expect(versions, `${lang} should have correct versions`).toEqual(expectedVersions);
      
      // Check dates
      const dates = releases.map(r => r.date);
      expect(dates, `${lang} should have correct dates`).toEqual(expectedDates);
    }
    
    console.log('✅ All translations have consistent versions and dates');
  });

  test('Create integration example for developers', async () => {
    console.log('Creating integration example...');
    
    // Example of how to use the translation files
    const exampleLang = 'ja';
    const module = await import(`../src/data/releases/index-${exampleLang}.js`);
    
    console.log('\n📚 Integration Example:');
    console.log('======================');
    console.log(`// Import translation for ${exampleLang}`);
    console.log(`import { releaseMetadata, getLatestVersion } from './src/data/releases/index-${exampleLang}.js';`);
    console.log('');
    console.log('// Use in component:');
    console.log('const latest = getLatestVersion();');
    console.log(`console.log(latest.title); // "${module.getLatestVersion().title}"`);
    console.log('');
    console.log('// Or iterate through all releases:');
    console.log('releaseMetadata.forEach(release => {');
    console.log('  console.log(`${release.version}: ${release.title}`);');
    console.log('});');
    console.log('');
    console.log('Sample output:');
    
    const sampleReleases = module.releaseMetadata.slice(0, 3);
    for (const release of sampleReleases) {
      console.log(`${release.version}: ${release.title}`);
    }
    
    console.log('\n🎯 Translation files are ready for integration!');
    expect(true, 'Integration example created successfully').toBe(true);
  });

});