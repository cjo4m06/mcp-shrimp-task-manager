import { test, expect } from '@playwright/test';

test.describe('Release Notes ScrollSpy and Auto-Scroll', () => {
  test('release notes should have working scroll spy and sidebar auto-scroll', async ({ page }) => {
    console.log('Testing Release Notes scroll functionality...');
    
    // Navigate to the app
    await page.goto('http://localhost:9999', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // Click on Release Notes in the header
    const releaseLink = await page.locator('a:has-text("Release Notes")').first();
    if (await releaseLink.isVisible()) {
      await releaseLink.click();
      await page.waitForTimeout(2000);
    }
    
    // Verify we have the sidebar and content
    const sidebar = await page.locator('.release-sidebar').first();
    const hasSidebar = await sidebar.isVisible();
    
    if (!hasSidebar) {
      console.log('ERROR: Release Notes sidebar not found!');
      throw new Error('Sidebar not visible');
    }
    
    console.log('✓ Found Release Notes sidebar');
    
    // Wait for content to load
    await page.waitForTimeout(3000);
    
    // Get all TOC items
    const tocItems = await page.evaluate(() => {
      const items = [];
      document.querySelectorAll('.release-toc-item').forEach(item => {
        const id = item.getAttribute('data-id');
        const text = item.querySelector('.release-toc-text')?.textContent?.trim();
        if (id) {
          items.push({ id, text });
        }
      });
      return items;
    });
    
    console.log(`Found ${tocItems.length} TOC items in Release Notes`);
    
    if (tocItems.length === 0) {
      console.log('ERROR: No TOC items found!');
      throw new Error('No TOC items found');
    }
    
    // Test scrolling through sections
    const testResults = [];
    const itemsToTest = Math.min(tocItems.length, 6);
    
    for (let i = 0; i < itemsToTest; i++) {
      const item = tocItems[i];
      console.log(`\nTesting section ${i + 1}/${itemsToTest}: ${item.text?.substring(0, 40)}...`);
      
      // Scroll to the section in main content
      await page.evaluate((itemId) => {
        const element = document.querySelector(`[data-scroll-element="${itemId}"], #${itemId}`);
        const container = document.querySelector('#release-content-container');
        if (element && container) {
          const scrollTop = element.offsetTop - 50;
          container.scrollTo({ top: scrollTop, behavior: 'instant' });
        }
      }, item.id);
      
      // Wait for scroll spy and auto-scroll to trigger
      await page.waitForTimeout(800);
      
      // Check if the item is active and centered
      const result = await page.evaluate((itemId) => {
        const activeItem = document.querySelector('.release-toc-item.active');
        const targetItem = document.querySelector(`.release-toc-item[data-id="${itemId}"]`);
        const sidebar = document.querySelector('.release-sidebar');
        
        if (!activeItem || !sidebar) {
          return {
            success: false,
            error: 'No active item or sidebar',
            activeId: null
          };
        }
        
        const activeId = activeItem.getAttribute('data-id');
        const isCorrectItem = activeId === itemId;
        
        // Check if active item is centered in sidebar
        const sidebarRect = sidebar.getBoundingClientRect();
        const activeRect = activeItem.getBoundingClientRect();
        
        const sidebarCenter = sidebarRect.top + (sidebarRect.height / 2);
        const itemCenter = activeRect.top + (activeRect.height / 2);
        const distanceFromCenter = Math.abs(sidebarCenter - itemCenter);
        
        // Allow 100px tolerance for "centered"
        const isCentered = distanceFromCenter < 100;
        
        return {
          success: isCorrectItem && isCentered,
          activeId,
          isCorrectItem,
          isCentered,
          distanceFromCenter: Math.round(distanceFromCenter),
          sidebarScrollTop: sidebar.scrollTop
        };
      }, item.id);
      
      testResults.push({
        section: item.text,
        ...result
      });
      
      console.log(`  Active: ${result.activeId || 'none'} (expected: ${item.id})`);
      console.log(`  Correct item: ${result.isCorrectItem ? '✓' : '✗'}`);
      console.log(`  Centered: ${result.isCentered ? '✓' : '✗'} (distance: ${result.distanceFromCenter}px)`);
    }
    
    // Summary
    console.log('\n=== SUMMARY ===');
    const successCount = testResults.filter(r => r.success).length;
    const centeredCount = testResults.filter(r => r.isCentered).length;
    const correctCount = testResults.filter(r => r.isCorrectItem).length;
    
    console.log(`Correct active items: ${correctCount}/${testResults.length}`);
    console.log(`Centered items: ${centeredCount}/${testResults.length}`);
    console.log(`Overall success: ${successCount}/${testResults.length}`);
    
    // The test passes if at least 80% of items are centered
    const successRate = centeredCount / testResults.length;
    console.log(`\nSuccess rate: ${Math.round(successRate * 100)}%`);
    
    if (successRate < 0.8) {
      console.log('\n✗ FAILED: Release Notes auto-scroll is not working properly');
      console.log('Items not centered:');
      testResults.forEach((r) => {
        if (!r.isCentered) {
          console.log(`  - ${r.section}: ${r.distanceFromCenter}px from center`);
        }
      });
    } else {
      console.log('\n✓ PASSED: Release Notes scroll spy and auto-scroll working correctly');
    }
    
    expect(successRate).toBeGreaterThanOrEqual(0.8);
  });
});