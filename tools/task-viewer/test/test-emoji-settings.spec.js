import { test, expect } from '@playwright/test';

test.describe('Emoji Template Settings', () => {
  test('should save and apply custom emoji templates', async ({ page }) => {
    // Navigate to the app (check multiple common ports)
    let baseUrl = null;
    const ports = [10000, 10001, 10002, 9998, 9999];
    
    for (const port of ports) {
      try {
        await page.goto(`http://localhost:${port}`, { waitUntil: 'networkidle', timeout: 2000 });
        baseUrl = `http://localhost:${port}`;
        break;
      } catch (e) {
        // Try next port
      }
    }
    
    if (!baseUrl) {
      throw new Error('Could not find running server on any expected port');
    }
    
    await page.waitForTimeout(1000);
    
    // Check if there's a project, if not create one
    const addProjectBtn = await page.$('button:has-text("+ Add Project")');
    if (addProjectBtn) {
      await addProjectBtn.click();
      await page.fill('input[placeholder*="Project Name"]', 'Test Project');
      await page.fill('input[placeholder*=".json"]', '/tmp/test-tasks.json');
      await page.click('button:has-text("Create")');
      await page.waitForTimeout(1000);
    }
    
    // Navigate to settings tab
    await page.click('.inner-tab:has-text("⚙️")');
    await page.waitForTimeout(1000);
    
    // Check if emoji template fields exist
    const robotTemplateField = await page.$('textarea#robotEmojiTemplate');
    const armTemplateField = await page.$('textarea#armEmojiTemplate');
    
    expect(robotTemplateField).toBeTruthy();
    expect(armTemplateField).toBeTruthy();
    
    // Set custom templates
    const customRobotTemplate = 'Custom robot template: [AGENT] for task [UUID]';
    const customArmTemplate = 'Custom arm template: [AGENT_NAME] for task [UUID]';
    
    await page.fill('textarea#robotEmojiTemplate', customRobotTemplate);
    await page.fill('textarea#armEmojiTemplate', customArmTemplate);
    
    // Save settings
    await page.click('button:has-text("Save")');
    await page.waitForTimeout(1000);
    
    // Navigate away and back to verify persistence
    await page.click('.inner-tab:has-text("📋")'); // Go to tasks
    await page.waitForTimeout(500);
    await page.click('.inner-tab:has-text("⚙️")'); // Back to settings
    await page.waitForTimeout(1000);
    
    // Verify the values persisted
    const savedRobotValue = await page.inputValue('textarea#robotEmojiTemplate');
    const savedArmValue = await page.inputValue('textarea#armEmojiTemplate');
    
    console.log('Saved robot template:', savedRobotValue);
    console.log('Saved arm template:', savedArmValue);
    
    expect(savedRobotValue).toBe(customRobotTemplate);
    expect(savedArmValue).toBe(customArmTemplate);
  });
});