import { test, expect } from '@playwright/test';

test.describe('Debug TOC Rendering', () => {
  test('should debug how TOC is rendered in Release Notes', async ({ page }) => {
    await page.goto('http://localhost:9998');
    await page.waitForLoadState('networkidle');
    
    await page.click('text=Release Notes');
    await page.waitForTimeout(2000);
    
    console.log('=== DEBUGGING TOC RENDERING ===');
    
    // Select first version
    const versionButton = page.locator('.version-list button, .version-list li button').first();
    await versionButton.click();
    await page.waitForTimeout(3000);
    
    // Look for TOC with various selectors
    const tocSelectors = [
      '.toc-list',
      '.table-of-contents', 
      '.release-toc',
      '[class*="toc"]',
      '[class*="table"]',
      'ul[class*="list"]',
      '.release-sidebar ul',
      '.release-sidebar > *'
    ];
    
    console.log('\\n--- SEARCHING FOR TOC WITH DIFFERENT SELECTORS ---');
    
    for (const selector of tocSelectors) {
      const count = await page.locator(selector).count();
      if (count > 0) {
        console.log(`✅ "${selector}": ${count} elements found`);
        
        // Get sample content from first match
        const firstMatch = page.locator(selector).first();
        const content = await firstMatch.textContent();
        console.log(`   Content preview: ${content?.substring(0, 100) || 'No text'}...`);
        
        // Check if it has clickable children
        const clickableChildren = await firstMatch.locator('[style*="cursor: pointer"], a, button').count();
        console.log(`   Clickable children: ${clickableChildren}`);
      } else {
        console.log(`❌ "${selector}": 0 elements`);
      }
    }
    
    // Check entire sidebar structure
    console.log('\\n--- RELEASE SIDEBAR STRUCTURE ---');
    const sidebarExists = await page.locator('.release-sidebar').count();
    console.log(`Release sidebar found: ${sidebarExists}`);
    
    if (sidebarExists > 0) {
      const sidebarStructure = await page.locator('.release-sidebar').evaluate(sidebar => {
        const getAllElements = (element, depth = 0) => {
          if (depth > 3) return { tagName: element.tagName, tooDeep: true };
          
          return {
            tagName: element.tagName,
            className: element.className || '',
            id: element.id || '',
            textPreview: element.textContent?.substring(0, 50) || '',
            childCount: element.children.length,
            children: Array.from(element.children).slice(0, 5).map(child => 
              getAllElements(child, depth + 1)
            )
          };
        };
        
        return getAllElements(sidebar);
      });
      
      console.log('Sidebar structure:', JSON.stringify(sidebarStructure, null, 2));
    }
    
    // Check if TOC data exists in component state
    console.log('\\n--- CHECKING FOR TOC DATA ---');
    const tocData = await page.evaluate(() => {
      // Look for any elements that might contain TOC data
      const possibleTocContainers = document.querySelectorAll('[data-toc], [data-table-of-contents], .version-toc, .toc, [id*="toc"]');
      
      return {
        tocContainers: possibleTocContainers.length,
        allListElements: document.querySelectorAll('ul, ol').length,
        releaseContent: document.querySelector('#release-content-container')?.textContent?.length || 0
      };
    });
    
    console.log('TOC data check:', tocData);
    
    // Check if there are any buttons or links that might be TOC items
    console.log('\\n--- CHECKING FOR POTENTIAL TOC ITEMS ---');
    const potentialTocItems = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button')).filter(btn => 
        btn.textContent && btn.textContent.length > 3 && !btn.textContent.includes('Expand')
      );
      
      const links = Array.from(document.querySelectorAll('a')).filter(link => 
        link.textContent && link.textContent.length > 3
      );
      
      return {
        potentialButtons: buttons.slice(0, 10).map(btn => ({
          text: btn.textContent?.substring(0, 40) || '',
          className: btn.className || '',
          hasOnClick: !!btn.onclick
        })),
        potentialLinks: links.slice(0, 10).map(link => ({
          text: link.textContent?.substring(0, 40) || '',
          className: link.className || '',
          href: link.href || ''
        }))
      };
    });
    
    console.log('Potential TOC items:', JSON.stringify(potentialTocItems, null, 2));
  });
});