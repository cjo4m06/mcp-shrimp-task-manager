import { test, expect } from '@playwright/test';

test.describe('Page Structure Debug', () => {
  test('should examine actual page structure', async ({ page }) => {
    await page.goto('http://localhost:9998');
    await page.waitForLoadState('networkidle');
    
    console.log('=== PAGE TITLE ===');
    console.log(await page.title());
    
    console.log('=== INITIAL URL ===');
    console.log(page.url());
    
    // Take screenshot
    await page.screenshot({ path: 'debug-initial-page.png' });
    
    // Check if Help link exists and click it
    const helpLinks = await page.locator('text=Help').count();
    console.log(`Found ${helpLinks} Help links`);
    
    if (helpLinks > 0) {
      console.log('Clicking Help link...');
      await page.click('text=Help');
      await page.waitForTimeout(2000);
      
      console.log('=== URL AFTER CLICKING HELP ===');
      console.log(page.url());
      
      // Take screenshot after clicking Help
      await page.screenshot({ path: 'debug-after-help-click.png' });
      
      // Check what elements are present
      console.log('=== ALL DATA-TESTID ELEMENTS ===');
      const testIds = await page.locator('[data-testid]').evaluateAll(elements =>
        elements.map(el => ({
          testId: el.getAttribute('data-testid'),
          tagName: el.tagName,
          text: el.textContent?.trim().substring(0, 50) || ''
        }))
      );
      testIds.forEach(item => {
        console.log(`  [data-testid="${item.testId}"] ${item.tagName}: "${item.text}"`);
      });
      
      // Check for divs that might contain content
      console.log('=== MAIN CONTENT CONTAINERS ===');
      const mainDivs = await page.locator('body > div').evaluateAll(elements =>
        elements.map((el, index) => ({
          index,
          className: el.className,
          id: el.id,
          children: el.children.length,
          textLength: el.textContent?.length || 0
        }))
      );
      mainDivs.forEach(div => {
        console.log(`Div ${div.index}: class="${div.className}", id="${div.id}", children=${div.children}, textLength=${div.textLength}`);
      });
      
      // Look for any anchor links with #
      console.log('=== ANCHOR LINKS WITH # ===');
      const anchorLinks = await page.locator('a[href*="#"]').evaluateAll(elements =>
        elements.slice(0, 10).map(el => ({
          href: el.getAttribute('href'),
          text: el.textContent?.trim() || '',
          isVisible: el.offsetParent !== null
        }))
      );
      anchorLinks.forEach(link => {
        console.log(`  "${link.text}" -> ${link.href} (visible: ${link.isVisible})`);
      });
    }
  });
});