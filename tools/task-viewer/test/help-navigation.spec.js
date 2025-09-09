import { test, expect } from '@playwright/test';

test.describe('Help Page Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the help page
    await page.goto('http://localhost:9998');
    await page.waitForLoadState('networkidle');
    
    // Click on Help link in header
    await page.click('text=Help');
    await page.waitForTimeout(1000);
  });

  test('should have table of contents with clickable items', async ({ page }) => {
    // Wait for table of contents to load
    await page.waitForSelector('.toc-item', { timeout: 5000 });
    
    // Get all TOC items
    const tocItems = await page.locator('.toc-item').all();
    console.log(`Found ${tocItems.length} TOC items`);
    
    // Check each TOC item has proper href and data-target
    for (let i = 0; i < Math.min(tocItems.length, 5); i++) {
      const item = tocItems[i];
      const href = await item.getAttribute('data-target');
      const text = await item.textContent();
      console.log(`TOC item ${i}: "${text}" -> target: "${href}"`);
      
      // Verify the target element exists
      if (href) {
        const targetElement = await page.locator(`#${href.replace('#', '')}`);
        const exists = await targetElement.count() > 0;
        console.log(`Target element #${href.replace('#', '')} exists: ${exists}`);
      }
    }
  });

  test('should scroll to section when TOC item is clicked', async ({ page }) => {
    // Wait for content to load
    await page.waitForSelector('.toc-item', { timeout: 5000 });
    
    // Get the content container
    const contentContainer = page.locator('[data-testid="help-content"]');
    await expect(contentContainer).toBeVisible();
    
    // Get first TOC item with a valid target
    const firstTocItem = page.locator('.toc-item').first();
    const target = await firstTocItem.getAttribute('data-target');
    console.log(`Clicking first TOC item with target: ${target}`);
    
    if (target) {
      // Get initial scroll position
      const initialScrollTop = await contentContainer.evaluate(el => el.scrollTop);
      console.log(`Initial scroll position: ${initialScrollTop}`);
      
      // Click the TOC item
      await firstTocItem.click();
      await page.waitForTimeout(1000);
      
      // Check if scroll position changed
      const newScrollTop = await contentContainer.evaluate(el => el.scrollTop);
      console.log(`New scroll position: ${newScrollTop}`);
      
      // Verify the target element is visible in the container
      const targetElement = page.locator(target);
      const isVisible = await targetElement.isVisible();
      console.log(`Target element ${target} is visible: ${isVisible}`);
      
      // Check if target element is in viewport of container
      const targetBounds = await targetElement.boundingBox();
      const containerBounds = await contentContainer.boundingBox();
      
      if (targetBounds && containerBounds) {
        const isInViewport = targetBounds.y >= containerBounds.y && 
                            targetBounds.y <= containerBounds.y + containerBounds.height;
        console.log(`Target is in container viewport: ${isInViewport}`);
        console.log(`Target Y: ${targetBounds.y}, Container Y: ${containerBounds.y}, Container Height: ${containerBounds.height}`);
      }
    }
  });

  test('should highlight current section while scrolling', async ({ page }) => {
    // Wait for content to load
    await page.waitForSelector('.toc-item', { timeout: 5000 });
    
    const contentContainer = page.locator('[data-testid="help-content"]');
    await expect(contentContainer).toBeVisible();
    
    // Scroll down in the content area
    await contentContainer.evaluate(el => {
      el.scrollTop = 200;
    });
    await page.waitForTimeout(500);
    
    // Check which TOC item is highlighted
    const activeTocItems = await page.locator('.toc-item.active').count();
    console.log(`Active TOC items after scrolling: ${activeTocItems}`);
    
    if (activeTocItems > 0) {
      const activeItem = page.locator('.toc-item.active').first();
      const activeText = await activeItem.textContent();
      const activeTarget = await activeItem.getAttribute('data-target');
      console.log(`Active item: "${activeText}" -> ${activeTarget}`);
    }
  });

  test('should debug ID generation and matching', async ({ page }) => {
    // Wait for content to load
    await page.waitForSelector('.toc-item', { timeout: 5000 });
    
    // Get all TOC items and their targets
    const tocTargets = await page.locator('.toc-item').evaluateAll(items => 
      items.map(item => ({
        text: item.textContent.trim(),
        target: item.getAttribute('data-target'),
        href: item.getAttribute('href')
      }))
    );
    
    console.log('TOC Items and their targets:');
    tocTargets.forEach((item, i) => {
      console.log(`${i}: "${item.text}" -> target: "${item.target}", href: "${item.href}"`);
    });
    
    // Get all elements with IDs in the content area
    const contentIds = await page.locator('[data-testid="help-content"] [id]').evaluateAll(elements => 
      elements.map(el => ({
        id: el.id,
        tagName: el.tagName,
        text: el.textContent.trim().substring(0, 50)
      }))
    );
    
    console.log('\nContent elements with IDs:');
    contentIds.forEach((item, i) => {
      console.log(`${i}: #${item.id} (${item.tagName}) -> "${item.text}..."`);
    });
    
    // Check for mismatches
    const mismatches = [];
    tocTargets.forEach(tocItem => {
      if (tocItem.target) {
        const targetId = tocItem.target.replace('#', '');
        const exists = contentIds.some(contentItem => contentItem.id === targetId);
        if (!exists) {
          mismatches.push({ tocText: tocItem.text, targetId, exists: false });
        }
      }
    });
    
    if (mismatches.length > 0) {
      console.log('\nMISMATCHES FOUND:');
      mismatches.forEach(mismatch => {
        console.log(`TOC item "${mismatch.tocText}" targets #${mismatch.targetId} but element doesn't exist`);
      });
    } else {
      console.log('\nNo ID mismatches found');
    }
  });
});