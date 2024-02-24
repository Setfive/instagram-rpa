import puppeteer from 'puppeteer';
import * as fs from 'fs';
import 'dotenv/config'

(async () => {
  const INSTAGRAM_USERNAME = process.env.INSTAGRAM_USERNAME;
  const INSTAGRAM_PASSWORD = process.env.INSTAGRAM_PASSWORD;

  if(!INSTAGRAM_PASSWORD || !INSTAGRAM_USERNAME) {
    console.error('You must sent INSTAGRAM_USERNAME and INSTAGRAM_PASSWORD envars!');
    process.exit(-1);
  }

  console.log(`Logging in with ${INSTAGRAM_USERNAME} and ${INSTAGRAM_PASSWORD}`);

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: {
      width: 1920,
      height: 1080,
    },
    args: ["--start-fullscreen"],
  });

  const page = await browser.newPage();

  page.on("console", msg => console.log("PAGE LOG:", msg.text()));

  await page.goto('https://www.instagram.com/');

  const usernameField = await page.waitForSelector('[name="username"]', {timeout: 30 * 1000});
  const passwordField = await page.waitForSelector('[name="password"]', {timeout: 30 * 1000});
  const loginButton = await page.waitForSelector('[type="submit"]', {timeout: 30 * 1000});

  await usernameField.type(INSTAGRAM_USERNAME);

  await sleep(1);

  await passwordField.type(INSTAGRAM_PASSWORD);

  await sleep(1);

  await loginButton.click()

  await sleep(1);
  const saveLoginBtn = await page.$('._acan');
  if(saveLoginBtn) {
    await saveLoginBtn.click();
  }

})();

async function sleep(time) {
  return new Promise(resolve => {
    setTimeout(resolve, time);
  })
}