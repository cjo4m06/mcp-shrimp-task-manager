import { test, expect } from '@playwright/test';

test.describe('Debug Release Notes Structure', () => {
  test('should debug Release Notes page structure and elements', async ({ page }) => {
    await page.goto('http://localhost:9998');
    await page.waitForLoadState('networkidle');
    
    await page.click('text=Release Notes');
    await page.waitForTimeout(3000);
    
    console.log('=== DEBUGGING RELEASE NOTES STRUCTURE ===');
    
    // Check if Release Notes page loaded
    const isReleaseNotesPage = await page.locator('text=Release Notes').count();
    console.log(`Release Notes page loaded: ${isReleaseNotesPage > 0}`);
    
    // Check for content container
    const contentContainer = page.locator('#release-content-container');
    const containerExists = await contentContainer.count();
    console.log(`Release content container found: ${containerExists}`);
    
    // Check for scroll elements
    const scrollElementsCount = await contentContainer.locator('[data-scroll-element]').count();
    console.log(`Scroll elements with data-scroll-element: ${scrollElementsCount}`);
    
    // Check what TOC elements exist
    const tocElements = await page.locator('.toc-list').count();
    console.log(`TOC lists found: ${tocElements}`);
    
    // Check different types of clickable elements
    const allClickables = await page.locator('.toc-list [style*="cursor: pointer"]').count();
    const divClickables = await page.locator('.toc-list div[style*="cursor: pointer"]').count();
    const anchorClickables = await page.locator('.toc-list a').count();
    const buttonClickables = await page.locator('.toc-list button').count();
    
    console.log(`All clickable elements: ${allClickables}`);
    console.log(`Div clickables: ${divClickables}`);
    console.log(`Anchor clickables: ${anchorClickables}`);
    console.log(`Button clickables: ${buttonClickables}`);
    
    // Check if there's a version selected
    const versionInfo = await page.evaluate(() => {
      const versionButtons = document.querySelectorAll('.version-list button, .version-list li');
      return {
        versionCount: versionButtons.length,
        selectedVersions: Array.from(versionButtons).slice(0, 3).map(btn => ({
          text: btn.textContent?.trim().substring(0, 20) || '',
          isSelected: btn.style.backgroundColor.includes('79, 189, 186') || btn.classList.contains('selected')
        }))
      };
    });
    
    console.log(`\\nVersion info:`, versionInfo);
    
    // Check if TOC is populated for any version
    if (tocElements > 0) {
      const tocStructure = await page.evaluate(() => {
        const tocLists = document.querySelectorAll('.toc-list');
        return Array.from(tocLists).slice(0, 2).map((list, i) => {
          const items = list.querySelectorAll('div, a, button');
          return {
            listIndex: i,
            itemCount: items.length,
            firstFewItems: Array.from(items).slice(0, 5).map(item => ({
              tagName: item.tagName,
              text: item.textContent?.trim().substring(0, 30) || '',
              hasPointerCursor: item.style.cursor === 'pointer',
              hasOnClick: !!item.onclick
            }))
          };
        });
      });
      
      console.log(`\\nTOC Structure:`, JSON.stringify(tocStructure, null, 2));
    }
    
    // Check if content is loaded
    const contentText = await contentContainer.textContent();
    const hasContent = contentText && contentText.trim().length > 100;
    console.log(`Content loaded: ${hasContent ? 'YES' : 'NO'} (${contentText?.length || 0} chars)`);
    
    if (hasContent && scrollElementsCount > 0) {
      // Get first few scroll elements
      const scrollElementInfo = await contentContainer.locator('[data-scroll-element]').evaluateAll(elements => 
        elements.slice(0, 5).map((el, i) => ({
          index: i,
          id: el.getAttribute('data-scroll-element'),
          tagName: el.tagName,
          text: el.textContent?.trim().substring(0, 40) || ''
        }))
      );
      
      console.log(`\\nFirst few scroll elements:`, JSON.stringify(scrollElementInfo, null, 2));
    }
  });
});