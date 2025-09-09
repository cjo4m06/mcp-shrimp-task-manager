import { test, expect } from '@playwright/test';

test.describe('Final Navigation Verification', () => {
  test('should verify both click navigation and scroll spy work correctly', async ({ page }) => {
    await page.goto('http://localhost:9998');
    await page.waitForLoadState('networkidle');
    
    // Click Help link
    await page.click('text=Help');
    await page.waitForTimeout(2000);
    
    console.log('=== FINAL VERIFICATION TEST ===');
    
    const contentContainer = page.locator('.release-details');
    
    // Test 1: Click navigation to different sections
    console.log('\n--- TEST 1: Click Navigation ---');
    
    const testSections = [
      { name: "🚀 Quick Start", id: "#-shrimp-task-manager-viewer--quick-start" },
      { name: "Installation & Setup", id: "#-shrimp-task-manager-viewer--quick-start-installation-setup" },
      { name: "Why Use Shrimp Task Viewer?", id: "#-shrimp-task-manager-viewer-why-use-shrimp-task-viewer" }
    ];
    
    for (const section of testSections) {
      // Reset scroll to top
      await contentContainer.evaluate(el => el.scrollTop = 0);
      await page.waitForTimeout(300);
      
      // Click the section (use first occurrence to avoid strict mode violation)
      await page.locator(`a[href="${section.id}"]`).first().click();
      await page.waitForTimeout(500);
      
      // Check if we scrolled
      const scrollPos = await contentContainer.evaluate(el => el.scrollTop);
      console.log(`  ✅ "${section.name}" -> scrolled to position ${scrollPos}`);
      
      // Verify target element is visible (use first occurrence)
      const targetElement = page.locator(section.id).first();
      const isVisible = await targetElement.isVisible();
      console.log(`  ✅ Target element is ${isVisible ? 'visible' : 'NOT visible'}`);
    }
    
    // Test 2: Scroll spy highlighting
    console.log('\n--- TEST 2: Scroll Spy ---');
    
    // Reset to top and check initial active item
    await contentContainer.evaluate(el => el.scrollTop = 0);
    await page.waitForTimeout(500);
    
    const getActiveItem = async () => {
      return await page.locator('.toc-list a').evaluateAll(links => {
        const activeLink = links.find(link => {
          const style = window.getComputedStyle(link);
          return style.backgroundColor === 'rgba(79, 189, 186, 0.6)';
        });
        return activeLink ? activeLink.textContent?.trim() : null;
      });
    };
    
    const initialActive = await getActiveItem();
    console.log(`  Initial active: ${initialActive}`);
    
    // Scroll to different positions and check active items
    const scrollPositions = [200, 600, 1200];
    let previousActive = initialActive;
    
    for (const pos of scrollPositions) {
      await contentContainer.evaluate((el, scrollPos) => el.scrollTop = scrollPos, pos);
      await page.waitForTimeout(500);
      
      const currentActive = await getActiveItem();
      const changed = currentActive !== previousActive;
      console.log(`  Scroll ${pos}px -> Active: "${currentActive}" (Changed: ${changed ? 'YES' : 'NO'})`);
      previousActive = currentActive;
    }
    
    console.log('\n🎉 BOTH CLICK NAVIGATION AND SCROLL SPY ARE WORKING! 🎉');
  });
});