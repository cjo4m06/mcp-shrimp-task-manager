import { test, expect } from '@playwright/test';

test('Release Notes scroll spy and sidebar auto-scroll test', async ({ page }) => {
  await page.goto('http://localhost:9999');
  
  // Click on Release Notes
  await page.click('text=Release Notes');
  await page.waitForTimeout(1000);
  
  // Click on v4.0.0
  await page.click('text=v4.0.0');
  await page.waitForTimeout(2000);
  
  // Get content container and all TOC items
  const container = await page.locator('#release-content-container');
  const tocItems = await page.locator('.release-toc-item').all();
  
  console.log(`Found ${tocItems.length} TOC items`);
  
  // Get all section IDs
  const sectionData = [];
  for (const item of tocItems) {
    const dataId = await item.getAttribute('data-id');
    const text = await item.textContent();
    sectionData.push({ dataId, text: text.trim() });
  }
  
  console.log('TOC Items with IDs:');
  sectionData.forEach(item => {
    console.log(`  - "${item.text}" -> ID: "${item.dataId}"`);
  });
  
  // Find all scroll elements in content
  const scrollElements = await page.locator('[data-scroll-element]').all();
  console.log(`\nFound ${scrollElements.length} scroll elements in content`);
  
  for (const element of scrollElements.slice(0, 5)) {
    const id = await element.getAttribute('data-scroll-element');
    const text = await element.textContent();
    console.log(`  - Element ID: "${id}" -> Text: "${text.trim()}"`);
  }
  
  // Test scrolling to each section
  const results = [];
  const sidebar = await page.locator('.release-sidebar').first();
  
  for (let i = 0; i < Math.min(tocItems.length, 10); i++) {
    const item = tocItems[i];
    const dataId = await item.getAttribute('data-id');
    const text = await item.textContent();
    
    // Find the corresponding scroll element
    const scrollElement = page.locator(`[data-scroll-element="${dataId}"]`).first();
    const elementExists = await scrollElement.count() > 0;
    
    if (elementExists) {
      // Scroll to the element
      await container.evaluate((el, id) => {
        const target = el.querySelector(`[data-scroll-element="${id}"]`);
        if (target) {
          el.scrollTop = target.offsetTop - 50;
        }
      }, dataId);
      
      await page.waitForTimeout(500);
      
      // Check if item is marked as active
      const isActive = await item.evaluate(el => el.classList.contains('active'));
      
      // Check sidebar scroll position
      const sidebarScrollTop = await sidebar.evaluate(el => el.scrollTop);
      
      results.push({
        text: text.trim(),
        id: dataId,
        elementExists,
        isActive,
        sidebarScrollTop
      });
      
      console.log(`\nSection: "${text.trim()}"`);
      console.log(`  ID: "${dataId}"`);
      console.log(`  Element exists: ${elementExists}`);
      console.log(`  Active: ${isActive}`);
      console.log(`  Sidebar scroll: ${sidebarScrollTop}px`);
    } else {
      console.log(`\nSection: "${text.trim()}" - No matching element found for ID "${dataId}"`);
      results.push({
        text: text.trim(),
        id: dataId,
        elementExists: false,
        isActive: false,
        sidebarScrollTop: 0
      });
    }
  }
  
  // Calculate success rate
  const successful = results.filter(r => r.isActive && r.elementExists).length;
  const successRate = (successful / results.length * 100).toFixed(1);
  
  console.log('\n=== TEST RESULTS ===');
  console.log(`Success rate: ${successRate}% (${successful}/${results.length})`);
  console.log('\nDetailed results:');
  results.forEach(r => {
    const status = r.isActive ? '✓' : '✗';
    const exists = r.elementExists ? '' : ' (element not found)';
    console.log(`  ${status} ${r.text}${exists}`);
  });
  
  // Assert that at least some items are working
  expect(successful).toBeGreaterThan(0);
});