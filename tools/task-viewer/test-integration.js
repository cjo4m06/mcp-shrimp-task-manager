// Integration Test Script for NestedTabs Implementation
// This script tests all major features to ensure they work correctly

const puppeteer = require('puppeteer');

async function runIntegrationTests() {
  console.log('🧪 Starting integration tests for NestedTabs implementation...\n');
  
  const browser = await puppeteer.launch({ 
    headless: false, // Set to true for CI/CD
    devtools: true 
  });
  const page = await browser.newPage();
  
  try {
    // Navigate to the app
    await page.goto('http://localhost:9999');
    await page.waitForSelector('.app', { timeout: 5000 });
    console.log('✅ App loaded successfully');
    
    // Test 1: URL Synchronization
    console.log('\n📍 Testing URL synchronization...');
    
    // Check initial URL
    let url = page.url();
    console.log('Initial URL:', url);
    
    // Click on Release Notes tab
    await page.click('[class*="tab"]:has-text("Release Notes")');
    await page.waitForTimeout(500);
    url = page.url();
    console.log('After clicking Release Notes:', url);
    if (url.includes('tab=release-notes')) {
      console.log('✅ URL updated correctly for Release Notes tab');
    } else {
      console.log('❌ URL not updated for Release Notes tab');
    }
    
    // Click on Templates tab
    await page.click('[class*="tab"]:has-text("Templates")');
    await page.waitForTimeout(500);
    url = page.url();
    console.log('After clicking Templates:', url);
    if (url.includes('tab=templates')) {
      console.log('✅ URL updated correctly for Templates tab');
    } else {
      console.log('❌ URL not updated for Templates tab');
    }
    
    // Test 2: Browser Navigation
    console.log('\n🔙 Testing browser back/forward navigation...');
    await page.goBack();
    await page.waitForTimeout(500);
    url = page.url();
    if (url.includes('tab=release-notes')) {
      console.log('✅ Browser back navigation works');
    } else {
      console.log('❌ Browser back navigation failed');
    }
    
    await page.goForward();
    await page.waitForTimeout(500);
    url = page.url();
    if (url.includes('tab=templates')) {
      console.log('✅ Browser forward navigation works');
    } else {
      console.log('❌ Browser forward navigation failed');
    }
    
    // Test 3: Projects Tab and Profile Selection
    console.log('\n👥 Testing Projects tab and profile functionality...');
    await page.click('[class*="tab"]:has-text("Projects")');
    await page.waitForTimeout(500);
    
    // Check if Add Tab button exists
    const addTabButton = await page.$('button:has-text("Add Project")');
    if (addTabButton) {
      console.log('✅ Add Project button found');
    } else {
      console.log('❌ Add Project button not found');
    }
    
    // Test 4: Search/Filter Functionality
    console.log('\n🔍 Testing search functionality...');
    
    // First, we need to add a profile to test with
    // Click Add Project button
    if (addTabButton) {
      await addTabButton.click();
      await page.waitForSelector('.modal-overlay', { timeout: 2000 });
      console.log('✅ Add Profile modal opened');
      
      // Close modal with ESC or click outside
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
      const modalClosed = await page.$('.modal-overlay') === null;
      if (modalClosed) {
        console.log('✅ Modal closed successfully');
      } else {
        console.log('❌ Modal did not close');
      }
    }
    
    // Test 5: Tab Transitions
    console.log('\n🔄 Testing all tab transitions...');
    const tabs = ['Projects', 'Release Notes', 'Readme', 'Templates'];
    
    for (let i = 0; i < tabs.length; i++) {
      await page.click(`[class*="tab"]:has-text("${tabs[i]}")`);
      await page.waitForTimeout(300);
      
      // Check if the correct content is displayed
      const activeTab = await page.$eval('.tab.active', el => el.textContent);
      if (activeTab.includes(tabs[i])) {
        console.log(`✅ ${tabs[i]} tab activated correctly`);
      } else {
        console.log(`❌ ${tabs[i]} tab activation failed`);
      }
    }
    
    // Test 6: Component Rendering
    console.log('\n🎨 Testing component rendering...');
    
    // Check Release Notes
    await page.click('[class*="tab"]:has-text("Release Notes")');
    await page.waitForTimeout(500);
    const releaseNotesContent = await page.$('.release-notes-container');
    if (releaseNotesContent) {
      console.log('✅ Release Notes component rendered');
    } else {
      console.log('❌ Release Notes component not found');
    }
    
    // Check Readme/Help
    await page.click('[class*="tab"]:has-text("Readme")');
    await page.waitForTimeout(500);
    const readmeContent = await page.$('.help-container');
    if (readmeContent) {
      console.log('✅ Readme/Help component rendered');
    } else {
      console.log('❌ Readme/Help component not found');
    }
    
    // Check Templates
    await page.click('[class*="tab"]:has-text("Templates")');
    await page.waitForTimeout(500);
    const templatesContent = await page.$('[name="templates-content-area"]');
    if (templatesContent) {
      console.log('✅ Templates component rendered');
    } else {
      console.log('❌ Templates component not found');
    }
    
    // Test 7: Nested Tab Structure
    console.log('\n🏗️ Testing nested tab structure...');
    const outerTabs = await page.$$('.outer-tabs .tab');
    console.log(`Found ${outerTabs.length} outer tabs`);
    
    // Test 8: Language Selector
    console.log('\n🌐 Testing language selector presence...');
    const langSelector = await page.$('.language-selector');
    if (langSelector) {
      console.log('✅ Language selector present');
    } else {
      console.log('❌ Language selector not found');
    }
    
    console.log('\n✨ Integration tests completed!');
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  } finally {
    await browser.close();
  }
}

// Run the tests
runIntegrationTests().catch(console.error);