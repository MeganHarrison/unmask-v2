import { test, expect } from '@playwright/test';

test.describe('Dark Theme Dashboard', () => {
  test('should display dashboard with dark theme', async ({ page }) => {
    // Navigate to the dashboard
    await page.goto('/dashboard');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Scroll to the Text Messages section
    const textMessagesHeading = page.getByRole('heading', { name: 'Text Messages' });
    await textMessagesHeading.scrollIntoViewIfNeeded();
    
    // Take a screenshot of the dark themed table
    await page.screenshot({ path: 'dashboard-dark-theme-table.png', fullPage: true });
    
    // Verify dark theme classes are present
    const mainContainer = page.locator('div.bg-gray-950');
    await expect(mainContainer).toBeVisible();
    
    // Check if the Text Messages section has dark theme
    const textMessagesSection = page.locator('div.bg-gray-900');
    const sectionCount = await textMessagesSection.count();
    expect(sectionCount).toBeGreaterThan(0);
  });
});