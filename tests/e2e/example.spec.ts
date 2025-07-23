import { test, expect } from '@playwright/test';

test.describe('Unmask Application', () => {
  test('homepage loads successfully', async ({ page }) => {
    await page.goto('/');
    
    // Check for main heading or title
    await expect(page).toHaveTitle(/Unmask/);
    
    // Check for main navigation elements
    await expect(page.locator('nav')).toBeVisible();
  });

  test('navigation works correctly', async ({ page }) => {
    await page.goto('/');
    
    // Navigate to messages page
    await page.click('text=Messages');
    await expect(page).toHaveURL('/messages');
    
    // Navigate to trajectory page
    await page.click('text=Trajectory');
    await expect(page).toHaveURL('/trajectory');
    
    // Navigate to insights page
    await page.click('text=Insights');
    await expect(page).toHaveURL('/insights');
  });

  test('message import page is accessible', async ({ page }) => {
    await page.goto('/messages/import');
    
    // Check for file upload input
    await expect(page.locator('input[type="file"]')).toBeVisible();
    
    // Check for upload button
    await expect(page.locator('button:has-text("Upload")')).toBeVisible();
  });

  test('AI chat interface loads', async ({ page }) => {
    await page.goto('/ai-chat');
    
    // Check for chat input
    await expect(page.locator('textarea, input[type="text"]')).toBeVisible();
    
    // Check for send button
    await expect(page.locator('button:has-text("Send")')).toBeVisible();
  });
});