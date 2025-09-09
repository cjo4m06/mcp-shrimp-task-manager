import { test, expect } from '@playwright/test';

test.describe('Simple Container Test', () => {
  test('should find help-content-container', async ({ page }) => {
    await page.goto('http://localhost:9998');
    await page.waitForLoadState('networkidle');
    
    // Go to Help page
    await page.click('text=Help');
    await page.waitForTimeout(2000);
    
    // Check if container exists
    const container = page.locator('#help-content-container');
    const containerExists = await container.count();
    console.log(`Container #help-content-container found: ${containerExists > 0}`);
    
    if (containerExists > 0) {
      const containerInfo = await container.evaluate(el => ({
        tagName: el.tagName,
        className: el.className,
        id: el.id,
        hasScroll: el.scrollHeight > el.clientHeight,
        scrollHeight: el.scrollHeight,
        clientHeight: el.clientHeight
      }));
      
      console.log('Container info:', containerInfo);
    }
    
    // Check ScrollLink elements
    const scrollLinks = await page.locator('[role="button"]').count();
    const regularLinks = await page.locator('a[href]').count();
    const styledLinks = await page.locator('[style*="cursor: pointer"]').count();
    
    console.log(`ScrollLinks (role=button): ${scrollLinks}`);
    console.log(`Regular links (href): ${regularLinks}`);
    console.log(`Styled links (cursor pointer): ${styledLinks}`);
    
    // Test first styled link
    if (styledLinks > 0) {
      const firstLink = page.locator('[style*="cursor: pointer"]').first();
      const linkInfo = await firstLink.evaluate(el => ({
        tagName: el.tagName,
        textContent: el.textContent?.trim().substring(0, 30) || '',
        role: el.getAttribute('role'),
        to: el.getAttribute('to'),
        href: el.getAttribute('href'),
        hasClickHandler: !!el.onclick
      }));
      
      console.log('First clickable link info:', linkInfo);
    }
  });
});