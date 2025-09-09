import { test, expect } from '@playwright/test';

test.describe('ID Mismatch Debug', () => {
  test('should identify exact ID mismatches', async ({ page }) => {
    await page.goto('http://localhost:9998');
    await page.waitForLoadState('networkidle');
    
    // Click Help link
    await page.click('text=Help');
    await page.waitForTimeout(2000);
    
    console.log('=== EXACT ID COMPARISON ===');
    
    // Get all TOC links with their exact IDs
    const tocLinks = await page.locator('.toc-list a[href^="#"]').evaluateAll(links =>
      links.slice(0, 10).map(link => ({
        text: link.textContent?.trim() || '',
        href: link.getAttribute('href'),
        targetId: link.getAttribute('href')?.replace('#', '') || ''
      }))
    );
    
    // Get all content elements with their exact IDs
    const contentElements = await page.locator('.release-details [id]').evaluateAll(elements =>
      elements.slice(0, 10).map(el => ({
        id: el.id,
        tagName: el.tagName,
        text: el.textContent?.trim().substring(0, 50) || ''
      }))
    );
    
    console.log('\n--- TOC LINKS ---');
    tocLinks.forEach((link, index) => {
      console.log(`${index}: "${link.text}" -> wants #${link.targetId}`);
    });
    
    console.log('\n--- CONTENT ELEMENTS ---');
    contentElements.forEach((el, index) => {
      console.log(`${index}: #${el.id} (${el.tagName}) -> "${el.text}..."`);
    });
    
    console.log('\n--- MISMATCHES ---');
    let mismatches = 0;
    tocLinks.forEach(link => {
      const exists = contentElements.some(el => el.id === link.targetId);
      if (!exists) {
        console.log(`❌ TOC "${link.text}" wants #${link.targetId} - NOT FOUND`);
        mismatches++;
      } else {
        console.log(`✅ TOC "${link.text}" wants #${link.targetId} - FOUND`);
      }
    });
    
    console.log(`\nTotal mismatches: ${mismatches} out of ${tocLinks.length}`);
  });
});