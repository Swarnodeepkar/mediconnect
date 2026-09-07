import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1500, height: 1000 } });
const errors = [];
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', (e) => errors.push(String(e)));

await page.goto('http://localhost:5183/login');
await page.waitForTimeout(800);
await page.click('.mc-select__trigger').catch(() => {});
await page.waitForTimeout(300);
await page.click('.mc-select__option:has-text("Staff")').catch(() => {});
await page.waitForTimeout(300);
await page.locator('button:has-text("Log In"), button[type="submit"]').first().click().catch(() => {});
await page.waitForTimeout(1000);
await page.goto('http://localhost:5183/staff');
await page.waitForTimeout(1000);
await page.screenshot({ path: 'C:/Users/MANOJS~1/AppData/Local/Temp/claude/c--Users-Manoj-S-OneDrive-Desktop-m-mediconnect-main/ba7ebdd4-00b6-4215-a230-f17dbc29e9e2/scratchpad/staff-home.png' });

await page.click('.pw-nav__item:has-text("Tasks")');
await page.waitForTimeout(500);
await page.screenshot({ path: 'C:/Users/MANOJS~1/AppData/Local/Temp/claude/c--Users-Manoj-S-OneDrive-Desktop-m-mediconnect-main/ba7ebdd4-00b6-4215-a230-f17dbc29e9e2/scratchpad/staff-tasks.png' });

await page.click('.pw-nav__item:has-text("Visits")');
await page.waitForTimeout(500);
await page.screenshot({ path: 'C:/Users/MANOJS~1/AppData/Local/Temp/claude/c--Users-Manoj-S-OneDrive-Desktop-m-mediconnect-main/ba7ebdd4-00b6-4215-a230-f17dbc29e9e2/scratchpad/staff-visits.png' });

await page.click('.pw-nav__item:has-text("Leave")');
await page.waitForTimeout(500);
await page.screenshot({ path: 'C:/Users/MANOJS~1/AppData/Local/Temp/claude/c--Users-Manoj-S-OneDrive-Desktop-m-mediconnect-main/ba7ebdd4-00b6-4215-a230-f17dbc29e9e2/scratchpad/staff-leave.png' });

await page.click('.pw-nav__item:has-text("Profile")');
await page.waitForTimeout(500);
await page.screenshot({ path: 'C:/Users/MANOJS~1/AppData/Local/Temp/claude/c--Users-Manoj-S-OneDrive-Desktop-m-mediconnect-main/ba7ebdd4-00b6-4215-a230-f17dbc29e9e2/scratchpad/staff-profile.png' });

console.log('ERRORS:', JSON.stringify(errors));
await browser.close();
