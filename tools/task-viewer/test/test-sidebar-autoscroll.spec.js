import { test, expect } from '@playwright/test';

test.describe('Help Page Sidebar Auto-Scroll', () => {
  test('sidebar should keep active item centered when scrolling', async ({ page }) => {
    // Start the test
    console.log('Starting sidebar auto-scroll test...');
    
    // Navigate to the app (dev server)
    await page.goto('http://localhost:9999', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // Click on Help in the header
    const helpLink = await page.locator('a:has-text("Help")').first();
    if (await helpLink.isVisible()) {
      await helpLink.click();
      await page.waitForTimeout(2000);
    }
    
    // Verify we have the sidebar and content
    const sidebar = await page.locator('.release-sidebar').first();
    const hasSidebar = await sidebar.isVisible();
    
    if (!hasSidebar) {
      console.log('ERROR: Sidebar not found!');
      throw new Error('Sidebar not visible');
    }
    
    console.log('✓ Found sidebar');
    
    // Wait a bit more for content to load
    await page.waitForTimeout(3000);
    
    // Get all TOC items
    const tocItems = await page.evaluate(() => {
      const items = [];
      // Debug: Check what elements exist
      const tocItemElements = document.querySelectorAll('.help-toc-item');
      console.log('Found TOC item elements:', tocItemElements.length);
      
      if (tocItemElements.length === 0) {
        // Try alternative selectors
        const altItems = document.querySelectorAll('[data-id]');
        console.log('Found elements with data-id:', altItems.length);
      }
      
      tocItemElements.forEach(item => {
        const id = item.getAttribute('data-id');
        const text = item.querySelector('.help-toc-text')?.textContent?.trim();
        if (id) {
          items.push({ id, text });
        }
      });
      return items;
    });
    
    console.log(`Found ${tocItems.length} TOC items`);
    
    if (tocItems.length === 0) {
      console.log('ERROR: No TOC items found!');
      throw new Error('No TOC items found');
    }
    
    // Test scrolling through sections
    const testResults = [];
    
    for (let i = 0; i < Math.min(tocItems.length, 8); i++) {
      const item = tocItems[i];
      console.log(`\nTesting section ${i + 1}/${tocItems.length}: ${item.text?.substring(0, 30)}...`);
      
      // Scroll to the section in main content
      await page.evaluate((itemId) => {
        const element = document.querySelector(`[data-scroll-element="${itemId}"], #${itemId}`);
        const container = document.querySelector('#help-content-container');
        if (element && container) {
          const rect = element.getBoundingClientRect();
          const containerRect = container.getBoundingClientRect();
          const scrollTop = element.offsetTop - 50;
          container.scrollTo({ top: scrollTop, behavior: 'instant' });
        }
      }, item.id);
      
      // Wait for scroll spy and auto-scroll to trigger
      await page.waitForTimeout(800);
      
      // Check if the item is active and centered
      const result = await page.evaluate((itemId) => {
        const activeItem = document.querySelector('.help-toc-item.active');
        const targetItem = document.querySelector(`.help-toc-item[data-id="${itemId}"]`);
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
          sidebarScrollTop: sidebar.scrollTop,
          itemTop: activeRect.top - sidebarRect.top,
          sidebarHeight: sidebarRect.height
        };
      }, item.id);
      
      testResults.push({
        section: item.text,
        ...result
      });
      
      console.log(`  Active: ${result.activeId || 'none'} (expected: ${item.id})`);
      console.log(`  Correct item: ${result.isCorrectItem ? '✓' : '✗'}`);
      console.log(`  Centered: ${result.isCentered ? '✓' : '✗'} (distance: ${result.distanceFromCenter}px)`);
      console.log(`  Sidebar scroll: ${result.sidebarScrollTop}px`);
    }
    
    // Test scrolling to bottom
    console.log('\n=== Testing scroll to bottom ===');
    const lastItem = tocItems[tocItems.length - 1];
    
    await page.evaluate((itemId) => {
      const element = document.querySelector(`[data-scroll-element="${itemId}"], #${itemId}`);
      const container = document.querySelector('#help-content-container');
      if (element && container) {
        element.scrollIntoView({ behavior: 'instant', block: 'start' });
      }
    }, lastItem.id);
    
    await page.waitForTimeout(1000);
    
    const bottomResult = await page.evaluate((itemId) => {
      const activeItem = document.querySelector('.help-toc-item.active');
      const sidebar = document.querySelector('.release-sidebar');
      
      if (!activeItem || !sidebar) return { success: false };
      
      const activeId = activeItem.getAttribute('data-id');
      const sidebarRect = sidebar.getBoundingClientRect();
      const activeRect = activeItem.getBoundingClientRect();
      
      const sidebarCenter = sidebarRect.top + (sidebarRect.height / 2);
      const itemCenter = activeRect.top + (activeRect.height / 2);
      const distanceFromCenter = Math.abs(sidebarCenter - itemCenter);
      
      return {
        activeId,
        isCentered: distanceFromCenter < 100,
        distanceFromCenter: Math.round(distanceFromCenter),
        isVisible: activeRect.top >= sidebarRect.top && activeRect.bottom <= sidebarRect.bottom
      };
    }, lastItem.id);
    
    console.log(`Bottom section active: ${bottomResult.activeId}`);
    console.log(`Centered: ${bottomResult.isCentered ? '✓' : '✗'} (distance: ${bottomResult.distanceFromCenter}px)`);
    console.log(`Visible: ${bottomResult.isVisible ? '✓' : '✗'}`);
    
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
      console.log('\n✗ FAILED: Auto-scroll is not working properly');
      console.log('Items not centered:');
      testResults.forEach((r, i) => {
        if (!r.isCentered) {
          console.log(`  - ${r.section}: ${r.distanceFromCenter}px from center`);
        }
      });
    } else {
      console.log('\n✓ PASSED: Auto-scroll is working correctly');
    }
    
    expect(successRate).toBeGreaterThanOrEqual(0.8);
  });
});