const { chromium } = require('/opt/node22/lib/node_modules/playwright');
(async () => {
  const browser = await chromium.launch({
    executablePath: '/opt/pw-browsers/chromium-1223/chrome-linux64/chrome',
    args: ['--no-sandbox', '--disable-dev-shm-usage']
  });
  const ctx = await browser.newContext({ ignoreHTTPSErrors: true });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('https://yulinl2.github.io/ai4statmath-benchmarks/', {
    waitUntil: 'networkidle', timeout: 30000
  });
  await page.waitForTimeout(3000);

  const tabs   = await page.$$eval('.tab', els => els.length);
  const cards  = await page.$$eval('.card', els => els.length);
  const chips  = await page.$$eval('.chip', els => els.length);
  const fnbs   = await page.$$eval('.fnb', els => els.length);
  const hasPT  = await page.evaluate(() => typeof prepTex === 'function');
  const hasBGP = await page.evaluate(() => typeof getBgPattern === 'function');
  const bnrBg  = await page.evaluate(() => {
    const el = document.getElementById('bnr');
    return el ? el.style.backgroundImage : 'n/a';
  });
  const slText = await page.$eval('#sl', el => el.textContent.trim());

  const pass = tabs===7 && cards===30 && chips>0 && fnbs>=6 &&
               hasPT && hasBGP && bnrBg!=='' && slText.length>0 && errors.length===0;

  console.log(JSON.stringify({
    pass, tabs, cards, chips, fnbs,
    hasPrepTex: hasPT, hasBgPattern: hasBGP,
    bnrBg: bnrBg.slice(0,60),
    slText: slText.slice(0,40),
    errors
  }, null, 2));
  await browser.close();
  process.exit(pass ? 0 : 1);
})().catch(e => { console.error(e.message); process.exit(1); });
