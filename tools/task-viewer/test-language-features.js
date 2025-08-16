import puppeteer from 'puppeteer';

const VIEWER_URL = 'http://localhost:9998';
const LANGUAGES = ['en', 'zh', 'es'];

async function testLanguageFeatures() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  console.log('🧪 Starting Cross-Language Integration Testing\n');
  
  try {
    // Navigate to the viewer
    await page.goto(VIEWER_URL, { waitUntil: 'networkidle2' });
    console.log('✅ Connected to Task Viewer');
    
    // Test 1: Language Switching
    console.log('\n📋 Test 1: Language Switching');
    for (const lang of LANGUAGES) {
      console.log(`  Testing ${lang}...`);
      
      // Click language selector
      const langSelector = await page.$('.language-selector');
      if (langSelector) {
        await langSelector.click();
        
        // Select language
        const langOption = await page.$(`[data-lang="${lang}"]`);
        if (langOption) {
          await langOption.click();
          await page.waitForTimeout(500); // Wait for UI update
          
          // Verify language changed
          const currentLang = await page.evaluate(() => {
            return localStorage.getItem('shrimpTaskViewerLanguage');
          });
          
          if (currentLang === lang) {
            console.log(`  ✅ Language switched to ${lang}`);
          } else {
            console.log(`  ❌ Failed to switch to ${lang}`);
          }
        }
      }
    }
    
    // Test 2: UI Translations
    console.log('\n📋 Test 2: UI Element Translations');
    const uiElements = {
      en: {
        tasks: 'Tasks',
        completed: 'Completed',
        search: 'Search tasks...'
      },
      zh: {
        tasks: '任务',
        completed: '已完成',
        search: '搜索任务...'
      },
      es: {
        tasks: 'Tareas',
        completed: 'Completadas',
        search: 'Buscar tareas...'
      }
    };
    
    for (const lang of LANGUAGES) {
      // Switch to language
      await page.evaluate((l) => {
        localStorage.setItem('shrimpTaskViewerLanguage', l);
      }, lang);
      await page.reload({ waitUntil: 'networkidle2' });
      
      console.log(`  Checking ${lang} translations...`);
      
      // Check for expected text
      const pageContent = await page.content();
      const expectedTexts = uiElements[lang];
      let allFound = true;
      
      for (const [key, text] of Object.entries(expectedTexts)) {
        if (pageContent.includes(text)) {
          console.log(`    ✅ Found "${text}"`);
        } else {
          console.log(`    ❌ Missing "${text}"`);
          allFound = false;
        }
      }
    }
    
    // Test 3: Documentation Tabs
    console.log('\n📋 Test 3: Documentation Translations');
    for (const lang of LANGUAGES) {
      await page.evaluate((l) => {
        localStorage.setItem('shrimpTaskViewerLanguage', l);
      }, lang);
      await page.reload({ waitUntil: 'networkidle2' });
      
      console.log(`  Testing ${lang} documentation...`);
      
      // Try to click Release Notes tab
      const releaseTab = await page.$('button:has-text("Release Notes"), button:has-text("发布说明"), button:has-text("Notas de la Versión")');
      if (releaseTab) {
        await releaseTab.click();
        await page.waitForTimeout(1000);
        console.log(`    ✅ Release Notes tab opened in ${lang}`);
      }
      
      // Try to click Help tab
      const helpTab = await page.$('button:has-text("Help"), button:has-text("帮助"), button:has-text("Ayuda")');
      if (helpTab) {
        await helpTab.click();
        await page.waitForTimeout(1000);
        console.log(`    ✅ Help tab opened in ${lang}`);
      }
    }
    
    // Test 4: Task Dependencies
    console.log('\n📋 Test 4: Task Dependency Display');
    // Click on first profile tab
    const firstTab = await page.$('.profile-tab');
    if (firstTab) {
      await firstTab.click();
      await page.waitForTimeout(1000);
      
      // Check if dependencies column exists
      const depColumn = await page.$('th:has-text("Dependencies"), th:has-text("依赖项"), th:has-text("Dependencias")');
      if (depColumn) {
        console.log('  ✅ Dependencies column found');
        
        // Check for task number format
        const taskNumbers = await page.$$eval('.task-number-badge', badges => badges.length);
        console.log(`  ✅ Found ${taskNumbers} task number badges`);
      } else {
        console.log('  ❌ Dependencies column not found');
      }
    }
    
    // Test 5: Layout Issues
    console.log('\n📋 Test 5: Layout and Text Overflow');
    const viewportSizes = [
      { width: 1920, height: 1080, name: 'Desktop' },
      { width: 768, height: 1024, name: 'Tablet' },
      { width: 375, height: 667, name: 'Mobile' }
    ];
    
    for (const viewport of viewportSizes) {
      await page.setViewport(viewport);
      console.log(`  Testing ${viewport.name} (${viewport.width}x${viewport.height})...`);
      
      // Check for horizontal scroll
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      
      if (!hasHorizontalScroll) {
        console.log(`    ✅ No horizontal overflow`);
      } else {
        console.log(`    ⚠️  Horizontal scroll detected`);
      }
    }
    
    console.log('\n✅ Cross-Language Integration Testing Complete!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
}

// Run the tests
testLanguageFeatures().catch(console.error);