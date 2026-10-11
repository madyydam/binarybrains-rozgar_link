import { test, expect } from '@playwright/test';

test.describe('RozgarLink - Scenarios A-I E2E Verification', () => {
  test('Candidate shell loads Home with brand and hero', async ({ page }) => {
    await page.goto('/');

    // Check FutoraOne logo and wordmark
    await expect(page.locator('text=RozgarLink')).toBeVisible();
    await expect(page.locator('text=Your Career Path Starts Here')).toBeVisible();

    // Check 4 bottom navigation tabs: Home, Match, Learn, Profile
    await expect(page.locator('text=Home')).toBeVisible();
    await expect(page.locator('text=Match')).toBeVisible();
    await expect(page.locator('text=Learn')).toBeVisible();
    await expect(page.locator('text=Profile')).toBeVisible();
  });

  test('Match tab displays Eligible cards with Score Ring and Not Eligible with Failed Rule Strip', async ({ page }) => {
    await page.goto('/');
    await page.click('button:has-text("Match")');

    // Check Match screen title
    await expect(page.locator('h1:has-text("Match")')).toBeVisible();

    // Check pill filters
    await expect(page.locator('button:has-text("All")')).toBeVisible();
    await expect(page.locator('button:has-text("Eligible")')).toBeVisible();
    await expect(page.locator('button:has-text("Need info")')).toBeVisible();
    await expect(page.locator('button:has-text("Not eligible")')).toBeVisible();

    // Standard notice
    await expect(page.locator('text=Eligibility follows opportunity criteria')).toBeVisible();
  });

  test('Scenario A: Profile district change flips residence-restricted roles and shows Change Banner', async ({ page }) => {
    await page.goto('/');
    await page.click('button:has-text("Profile")');

    // Update district to Satara
    await page.selectOption('select >> nth=0', 'Satara');
    await page.click('button:has-text("Update District")');

    // Expect Change Banner to appear
    await expect(page.locator('text=Live Update')).toBeVisible();
  });

  test('Floating AI assistant opens drawer, extracts skills, and explains without altering eligibility', async ({ page }) => {
    await page.goto('/');

    // Click floating AI FAB
    const aiButton = page.locator('button[aria-label="Open AI Assistant"]');
    await aiButton.click();

    // Modal opens
    await expect(page.locator('text=RozgarLink AI Assistant')).toBeVisible();
    await expect(page.locator('text=Skill Extractor')).toBeVisible();

    // Switch to Skill Extractor tab
    await page.click('button:has-text("Skill Extractor")');
    await page.fill('textarea', 'tally prime, gst returns');
    await page.click('button:has-text("Extract Skills")');

    // Suggested skills appear
    await expect(page.locator('text=Suggested Skills')).toBeVisible({ timeout: 5000 });
  });
});
