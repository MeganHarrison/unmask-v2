# Unmask: Testing Guide with Playwright

## Overview

This project uses Playwright for end-to-end (E2E) testing. Playwright provides cross-browser testing capabilities and can test both the frontend UI and API endpoints.

## Installation

```bash
# Install dependencies (including Playwright)
npm install

# Install Playwright browsers
npx playwright install
```

## Running Tests

### Basic Commands

```bash
# Run all tests
npm test

# Run tests with UI mode (recommended for development)
npm run test:ui

# Debug tests
npm run test:debug

# Generate test code by recording actions
npm run test:codegen
```

### Advanced Commands

```bash
# Run specific test file
npx playwright test tests/e2e/messages.spec.ts

# Run tests in headed mode (see browser)
npx playwright test --headed

# Run tests in specific browser
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit

# Run tests with specific tag
npx playwright test --grep @smoke
```

## Test Structure

```
tests/
├── e2e/                    # End-to-end tests
│   ├── example.spec.ts     # Basic navigation tests
│   ├── api.spec.ts         # API integration tests
│   ├── components.spec.ts  # Component-specific tests
│   ├── messages.spec.ts    # Message features
│   ├── trajectory.spec.ts  # Trajectory features
│   └── ai-chat.spec.ts     # AI chat features
├── fixtures/               # Test fixtures and helpers
│   ├── auth.ts            # Authentication helpers
│   └── data.ts            # Test data generators
└── utils/                 # Test utilities
    └── db-helpers.ts      # Database test helpers
```

## Writing Tests

### Basic Test Structure

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup before each test
    await page.goto('/');
  });

  test('should do something', async ({ page }) => {
    // Test implementation
    await page.click('button');
    await expect(page.locator('h1')).toHaveText('Expected Text');
  });
});
```

### Testing Components

```typescript
test('MessageTable displays data correctly', async ({ page }) => {
  // Navigate to page
  await page.goto('/messages');
  
  // Wait for data to load
  await page.waitForSelector('table');
  
  // Assert table contents
  const rows = await page.locator('tbody tr').count();
  expect(rows).toBeGreaterThan(0);
  
  // Check specific cell
  await expect(page.locator('td:has-text("Hello")')).toBeVisible();
});
```

### Testing API Endpoints

```typescript
test('API returns messages', async ({ request }) => {
  const response = await request.get('/api/messages', {
    headers: {
      'Authorization': 'Bearer test-token'
    }
  });
  
  expect(response.ok()).toBeTruthy();
  const data = await response.json();
  expect(data.messages).toBeDefined();
});
```

### Testing Forms

```typescript
test('can submit daily tracker form', async ({ page }) => {
  await page.goto('/daily-tracker');
  
  // Fill form fields
  await page.fill('[name="mood"]', '8');
  await page.fill('[name="connection_felt"]', '9');
  await page.selectOption('[name="conflicts"]', 'none');
  
  // Submit form
  await page.click('button[type="submit"]');
  
  // Assert success
  await expect(page.locator('.toast-success')).toBeVisible();
});
```

## Test Data Management

### Using Test Fixtures

```typescript
// tests/fixtures/auth.ts
import { test as base } from '@playwright/test';

export const test = base.extend({
  authenticatedPage: async ({ page }, use) => {
    // Set auth cookie or localStorage
    await page.context().addCookies([{
      name: 'auth-token',
      value: 'test-token',
      domain: 'localhost',
      path: '/'
    }]);
    
    await use(page);
  }
});
```

### Mocking API Responses

```typescript
test('handles empty message list', async ({ page }) => {
  // Mock empty response
  await page.route('**/api/messages', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ messages: [] })
    });
  });
  
  await page.goto('/messages');
  await expect(page.locator('text=No messages found')).toBeVisible();
});
```

## Environment Configuration

### Local Testing

```bash
# .env.test.local
NEXT_PUBLIC_WORKER_URL=http://localhost:8787
DATABASE_URL=file:./test.db
```

### CI/CD Testing

```yaml
# GitHub Actions secrets needed:
PLAYWRIGHT_TEST_BASE_URL
PLAYWRIGHT_TEST_WORKER_URL
PLAYWRIGHT_TEST_AUTH_TOKEN
```

## Best Practices

### 1. Use Data Attributes for Testing

```tsx
// In your components
<button data-testid="submit-button">Submit</button>

// In your tests
await page.click('[data-testid="submit-button"]');
```

### 2. Wait for Elements Properly

```typescript
// Good
await page.waitForSelector('.loading', { state: 'hidden' });
await expect(page.locator('.data')).toBeVisible();

// Bad
await page.waitForTimeout(2000); // Avoid fixed timeouts
```

### 3. Use Page Object Model

```typescript
// tests/pages/MessagesPage.ts
export class MessagesPage {
  constructor(private page: Page) {}
  
  async goto() {
    await this.page.goto('/messages');
  }
  
  async importCSV(filePath: string) {
    await this.page.setInputFiles('input[type="file"]', filePath);
    await this.page.click('button:has-text("Upload")');
  }
  
  async searchMessages(query: string) {
    await this.page.fill('[data-testid="search-input"]', query);
    await this.page.press('[data-testid="search-input"]', 'Enter');
  }
}
```

### 4. Test User Journeys

```typescript
test('complete relationship setup flow', async ({ page }) => {
  // 1. Create relationship
  await page.goto('/relationships/new');
  await page.fill('[name="name"]', 'Test Relationship');
  await page.click('button[type="submit"]');
  
  // 2. Import messages
  await page.click('text=Import Messages');
  await page.setInputFiles('input[type="file"]', 'test-messages.csv');
  
  // 3. View insights
  await page.click('text=View Insights');
  await expect(page.locator('h1')).toHaveText('Relationship Insights');
});
```

## Debugging Tests

### Visual Debugging

```bash
# Open Playwright Inspector
npx playwright test --debug

# Use UI Mode for better debugging experience
npm run test:ui
```

### Taking Screenshots

```typescript
test('visual regression', async ({ page }) => {
  await page.goto('/trajectory');
  await page.screenshot({ path: 'trajectory.png' });
  
  // On failure, screenshots are automatically captured
});
```

### Trace Viewer

```bash
# Run tests with trace
npx playwright test --trace on

# View trace
npx playwright show-trace trace.zip
```

## Continuous Integration

The project includes GitHub Actions workflow for automated testing:

1. Tests run on every push and PR
2. Multiple browsers tested in parallel
3. Test reports uploaded as artifacts
4. Failed test screenshots included

## Common Issues

### Port Conflicts

```typescript
// playwright.config.ts
webServer: {
  command: 'npm run dev',
  port: 3000,
  reuseExistingServer: !process.env.CI,
}
```

### Authentication in Tests

```typescript
// Set up global auth state
test.use({
  storageState: 'tests/auth.json'
});
```

### Flaky Tests

- Use `test.retry()` for unreliable tests
- Increase timeouts for slow operations
- Use proper wait conditions instead of fixed delays

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [API Reference](https://playwright.dev/docs/api/class-test)
- [VS Code Extension](https://marketplace.visualstudio.com/items?itemName=ms-playwright.playwright)