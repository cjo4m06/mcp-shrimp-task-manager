import { test, expect } from '@playwright/test';

test.describe('Help Page Debug', () => {
  test('should debug ID generation and clicking', async ({ page }) => {
    // Navigate to help page directly
    await page.goto('http://localhost:9998');
    await page.waitForLoadState('networkidle');
    
    // Click on Help link in header
    await page.click('text=Help');
    await page.waitForTimeout(2000);
    
    console.log('=== DEBUGGING HELP PAGE NAVIGATION ===');
    
    // Check if TOC items exist (they are anchor tags in the sidebar)
    const tocLinks = await page.locator('div:has([data-testid="help-content"]) a[href^="#"]').count();
    console.log(`Found ${tocLinks} TOC anchor links`);
    
    if (tocLinks === 0) {
      console.log('No TOC links found! Checking page structure...');
      
      // Try to find the help content container
      const helpContent = await page.locator('[data-testid="help-content"]').count();
      console.log(`Help content container found: ${helpContent}`);
      
      // Check for sidebar container
      const sidebarLinks = await page.locator('a').count();
      console.log(`Total links found: ${sidebarLinks}`);
      
      // Look for any element that might contain TOC
      const divWithLinks = await page.locator('div:has(a[href^="#"])').count();
      console.log(`Divs containing anchor links: ${divWithLinks}`);
      
      return;
    }
    
    // Get all TOC items and their targets
    const tocData = await page.locator('a[href^="#"]').evaluateAll(items => 
      items.slice(0, 10).map((item, index) => ({
        index,
        text: item.textContent?.trim() || '',
        href: item.getAttribute('href'),
        className: item.className
      }))
    );
    
    console.log('\n=== TOC ITEMS ===');
    tocData.forEach(item => {
      console.log(`${item.index}: "${item.text}"`);
      console.log(`  href: "${item.href}"`);
      console.log(`  className: "${item.className}"`);
    });
    
    // Get all elements with IDs in content area
    const contentElements = await page.locator('[id]').evaluateAll(elements =>
      elements.map(el => ({
        id: el.id,
        tagName: el.tagName,
        textContent: el.textContent?.trim().substring(0, 50) || '',
        className: el.className
      }))
    );
    
    console.log('\n=== CONTENT ELEMENTS WITH IDs ===');
    contentElements.forEach((el, index) => {
      console.log(`${index}: #${el.id} (${el.tagName})`);
      console.log(`  text: "${el.textContent}..."`);
      console.log(`  className: "${el.className}"`);
    });
    
    // Check for mismatches
    const mismatches = [];
    tocData.forEach(tocItem => {
      if (tocItem.href) {
        const targetId = tocItem.href.replace('#', '');
        const exists = contentElements.some(el => el.id === targetId);
        if (!exists) {
          mismatches.push(tocItem);
        }
      }
    });
    
    if (mismatches.length > 0) {
      console.log('\n=== MISMATCHES ===');
      mismatches.forEach(item => {
        console.log(`TOC "${item.text}" -> "${item.href}" (NOT FOUND)`);
      });
    } else {
      console.log('\n✅ All TOC items have matching content elements');
    }
    
    // Test clicking the first TOC item
    if (tocData.length > 0) {
      console.log('\n=== TESTING CLICK ===');
      const firstItem = tocData[0];
      console.log(`Clicking first item: "${firstItem.text}"`);
      
      // Get content container scroll position before click
      const contentContainer = page.locator('[data-testid="help-content"]');
      const initialScroll = await contentContainer.evaluate(el => el?.scrollTop || 0);
      console.log(`Initial scroll: ${initialScroll}`);
      
      // Click the first TOC item
      await page.locator('a[href^="#"]').first().click();
      await page.waitForTimeout(1000);
      
      // Check scroll position after click
      const newScroll = await contentContainer.evaluate(el => el?.scrollTop || 0);
      console.log(`New scroll: ${newScroll}`);
      console.log(`Scroll changed: ${newScroll !== initialScroll}`);
      
      // Check if target element exists and is visible
      if (firstItem.href) {
        const targetId = firstItem.href.replace('#', '');
        const targetElement = page.locator(`#${targetId}`);
        const isVisible = await targetElement.isVisible();
        const count = await targetElement.count();
        console.log(`Target #${targetId} exists: ${count > 0}, visible: ${isVisible}`);
        
        if (count > 0) {
          const bounds = await targetElement.boundingBox();
          console.log(`Target bounds:`, bounds);
        }
      }
    }
  });
});