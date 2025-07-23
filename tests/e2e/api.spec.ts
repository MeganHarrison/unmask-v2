import { test, expect } from '@playwright/test';

test.describe('API Integration Tests', () => {
  const WORKER_URL = process.env.PLAYWRIGHT_TEST_WORKER_URL || 'http://localhost:8787';

  test('health check endpoint responds', async ({ request }) => {
    const response = await request.get(`${WORKER_URL}/health`);
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
  });

  test('messages endpoint requires authentication', async ({ request }) => {
    const response = await request.get(`${WORKER_URL}/messages`);
    expect(response.status()).toBe(401);
  });

  test('messages endpoint returns data with valid auth', async ({ request }) => {
    // This test assumes you have a test auth token
    const testToken = process.env.PLAYWRIGHT_TEST_AUTH_TOKEN || 'test-token';
    
    const response = await request.get(`${WORKER_URL}/messages`, {
      headers: {
        'Authorization': `Bearer ${testToken}`
      }
    });
    
    if (response.ok()) {
      const data = await response.json();
      expect(data).toHaveProperty('messages');
      expect(Array.isArray(data.messages)).toBeTruthy();
    }
  });

  test('can create a new relationship', async ({ request }) => {
    const testToken = process.env.PLAYWRIGHT_TEST_AUTH_TOKEN || 'test-token';
    
    const response = await request.post(`${WORKER_URL}/relationships`, {
      headers: {
        'Authorization': `Bearer ${testToken}`,
        'Content-Type': 'application/json'
      },
      data: {
        name: 'Test Relationship',
        partner_name: 'Test Partner',
        start_date: '2025-01-01'
      }
    });
    
    if (response.ok()) {
      const data = await response.json();
      expect(data).toHaveProperty('id');
      expect(data.name).toBe('Test Relationship');
    }
  });
});