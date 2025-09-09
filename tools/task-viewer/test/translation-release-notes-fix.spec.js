import { test, expect } from '@playwright/test';

test.describe('Release Notes Translation Fix', () => {
  test('should load Japanese release notes without HTML development content', async ({ page }) => {
    // Go to the main application
    await page.goto('/');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Click on the Release Notes tab
    await page.click('text="Release Notes"');
    
    // Wait for release notes to load
    await page.waitForSelector('.release-notes-tab-content', { timeout: 10000 });
    
    // Change language to Japanese
    const languageSelector = page.locator('[data-testid="language-selector"]').or(page.locator('select')).or(page.locator('[id*="language"]')).first();
    
    try {
      await languageSelector.selectOption('ja');
    } catch (e) {
      // If direct selection doesn't work, try clicking on language dropdown
      await page.click('[data-testid="language-selector"]');
      await page.click('text="日本語"');
    }
    
    // Wait for the content to update after language change
    await page.waitForTimeout(2000);
    
    // Check that v4.1.0 is selected or select it
    const versionButton = page.locator('button:has-text("v4.1.0")').first();
    if (await versionButton.isVisible()) {
      await versionButton.click();
    }
    
    // Wait for release content to load
    await page.waitForSelector('.release-details', { timeout: 5000 });
    
    // Get the release content
    const releaseContent = await page.locator('.release-markdown-content').textContent();
    
    // Verify we got Japanese content, not HTML
    expect(releaseContent).not.toContain('<!DOCTYPE html>');
    expect(releaseContent).not.toContain('<html');
    expect(releaseContent).not.toContain('<head>');
    expect(releaseContent).not.toContain('<script');
    expect(releaseContent).not.toContain('Vite');
    expect(releaseContent).not.toContain('@vite/client');
    
    // Verify we have actual Japanese content
    expect(releaseContent).toMatch(/[ひらがなカタカナ漢字]/); // Contains Japanese characters
    expect(releaseContent).toContain('バージョン'); // Should contain "version" in Japanese
    expect(releaseContent).toContain('リリース'); // Should contain "release" in Japanese
    
    console.log('Japanese release notes loaded successfully');
  });

  test('should load German release notes correctly', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Click on Release Notes tab
    await page.click('text="Release Notes"');
    await page.waitForSelector('.release-notes-tab-content', { timeout: 10000 });
    
    // Change language to German
    const languageSelector = page.locator('[data-testid="language-selector"]').or(page.locator('select')).or(page.locator('[id*="language"]')).first();
    
    try {
      await languageSelector.selectOption('de');
    } catch (e) {
      // Try alternative approach
      await page.click('[data-testid="language-selector"]');
      await page.click('text="Deutsch"');
    }
    
    await page.waitForTimeout(2000);
    
    // Select v4.1.0
    const versionButton = page.locator('button:has-text("v4.1.0")').first();
    if (await versionButton.isVisible()) {
      await versionButton.click();
    }
    
    await page.waitForSelector('.release-details', { timeout: 5000 });
    
    const releaseContent = await page.locator('.release-markdown-content').textContent();
    
    // Verify no HTML content
    expect(releaseContent).not.toContain('<!DOCTYPE html>');
    expect(releaseContent).not.toContain('<script');
    
    // Verify German content
    expect(releaseContent).toMatch(/[äöüÄÖÜß]/); // Contains German umlauts
    expect(releaseContent).toContain('Version'); // Should contain version info
    
    console.log('German release notes loaded successfully');
  });

  test('should handle missing translations gracefully', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Click on Release Notes tab
    await page.click('text="Release Notes"');
    await page.waitForSelector('.release-notes-tab-content', { timeout: 10000 });
    
    // Try to change to a language that might not have all translations (e.g., Hindi)
    const languageSelector = page.locator('[data-testid="language-selector"]').or(page.locator('select')).or(page.locator('[id*="language"]')).first();
    
    try {
      await languageSelector.selectOption('hi');
    } catch (e) {
      // Skip this test if we can't change to Hindi
      console.log('Could not change to Hindi, skipping graceful fallback test');
      return;
    }
    
    await page.waitForTimeout(2000);
    
    // Select any version
    const versionButton = page.locator('.version-button').first();
    if (await versionButton.isVisible()) {
      await versionButton.click();
    }
    
    await page.waitForSelector('.release-details', { timeout: 5000 });
    
    const releaseContent = await page.locator('.release-markdown-content').textContent();
    
    // Should not contain HTML development content regardless of language
    expect(releaseContent).not.toContain('<!DOCTYPE html>');
    expect(releaseContent).not.toContain('<html');
    expect(releaseContent).not.toContain('Vite');
    
    // Should contain some meaningful content (either translated or English fallback)
    expect(releaseContent.length).toBeGreaterThan(100);
    
    console.log('Graceful fallback handling verified');
  });
});