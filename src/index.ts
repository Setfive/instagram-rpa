import puppeteer from 'puppeteer';
import * as fs from 'fs';
import 'dotenv/config'
import {SEARCH_BTN_SELECTOR, SEARCH_FIELD_SELECTOR, SEARCH_LINK} from "./selectors";

(async () => {
  const INSTAGRAM_USERNAME = process.env.INSTAGRAM_USERNAME;
  const INSTAGRAM_PASSWORD = process.env.INSTAGRAM_PASSWORD;

  if(!INSTAGRAM_PASSWORD || !INSTAGRAM_USERNAME) {
    console.error('You must sent INSTAGRAM_USERNAME and INSTAGRAM_PASSWORD envars!');
    process.exit(-1);
  }

  console.log(`Logging in with ${INSTAGRAM_USERNAME}`);

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: {
      width: 1920,
      height: 1080,
    },
    args: ["--start-fullscreen"],
  });

  const page = await browser.newPage();

  // page.on("console", msg => console.log("PAGE LOG:", msg.text()));

  await page.goto('https://www.instagram.com/');

  const usernameField = await page.waitForSelector('[name="username"]', {timeout: 30 * 1000});
  const passwordField = await page.waitForSelector('[name="password"]', {timeout: 30 * 1000});
  const loginButton = await page.waitForSelector('[type="submit"]', {timeout: 30 * 1000});

  await usernameField.type(INSTAGRAM_USERNAME);

  await sleep(1);

  await passwordField.type(INSTAGRAM_PASSWORD);

  await sleep(1);

  await loginButton.click()

  await page.waitForNavigation({waitUntil: 'networkidle2'});

  const saveLoginBtn = await page.$('._acan');
  if(saveLoginBtn) {
    console.log('Found saveLoginBtn');
    await saveLoginBtn.click();
    await sleep(1);
  }

  const noNotificationsBtn = await page.waitForSelector('._a9_1', {timeout: 30 * 1000});
  console.log('Dismissing notifications button');
  await noNotificationsBtn.click();

  await sleep(1);

  console.log('Waiting for search button...');
  const searchBtn = await page.waitForSelector(SEARCH_BTN_SELECTOR, {timeout: 60 * 1000});
  await searchBtn.click();

  console.log('Waiting for search field...');
  const searchField = await page.waitForSelector(SEARCH_FIELD_SELECTOR, {timeout: 30 * 1000});
  await searchField.type('#bostonfoodies');
  await sleep(3);

  console.log('Waiting for search link...');
  const searchLink = await page.waitForSelector(SEARCH_LINK, {timeout: 30 * 1000});
  await searchLink.click();
  
})();

async function sleep(time) {
  return new Promise(resolve => {
    setTimeout(resolve, time);
  })
}