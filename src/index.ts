import puppeteer from 'puppeteer';
import * as fs from 'fs';
import { stringify } from 'csv-stringify/sync';
import 'dotenv/config'
import {
  CLOSE_BTN, LIKE_COUNT, MESSAGE_BOX, MESSAGE_BTN, MESSAGE_SEND_BTN, NEXT_BTN,
  PHOTO_GRID,
  PHOTO_GRID_USERNAME, PHOTO_GRID_USERNAME_ONE, PHOTO_GRID_USERNAME_TWO, POST_DATE,
  SEARCH_BTN_SELECTOR,
  SEARCH_FIELD_SELECTOR,
  SEARCH_LINK
} from "./selectors";

interface IPostData {
  url: string,
  usernames: string,
  numLikes: number,
  postDate: string
}

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

  console.log('Waiting for grid');
  await page.waitForSelector(PHOTO_GRID, {timeout: 30 * 1000});
  const photoGridDivs = await page.$$(PHOTO_GRID);

  const photoData: IPostData[] = [];
  console.log('Clicking photos...');

  const a = await photoGridDivs[0].$('a');
  await a.click();

  for(let i = 0; i < 25; i++) {
    let postUsernames: string[] = [];
    let likeCount = -1;
    let postDate = '';
    const pageUrl = page.url();

    try {
      const usernameAhref = await page.waitForSelector(PHOTO_GRID_USERNAME, {timeout: 1 * 1000});
      const username = await usernameAhref.evaluate(el => el.textContent, usernameAhref);
      postUsernames.push(username);
    }catch(e) {
      const usernameOneAhref = await page.waitForSelector(PHOTO_GRID_USERNAME_ONE, {timeout: 1 * 1000});
      const usernameOne = await usernameOneAhref.evaluate(el => el.textContent, usernameOneAhref);

      const usernameTwoAhref = await page.waitForSelector(PHOTO_GRID_USERNAME_TWO, {timeout: 1 * 1000});
      const usernameTwo = await usernameTwoAhref.evaluate(el => el.textContent, usernameTwoAhref);

      postUsernames.push(usernameOne);
      postUsernames.push(usernameTwo);
    }

    try {
      const likeCountEl = await page.waitForSelector(LIKE_COUNT, {timeout: 1 * 1000});
      const likeCountVal = await likeCountEl.evaluate(el => el.textContent, likeCountEl);
      likeCount = parseInt(likeCountVal, 10);
    }catch(e) {
      console.error(e);
    }

    try {
      const dateEl = await page.waitForSelector(POST_DATE, {timeout: 1 * 1000});
      postDate = await dateEl.evaluate(el => el.getAttribute('datetime'), dateEl);
    }catch(e) {
      console.error(e);
    }

    const pd: IPostData = {
      url: pageUrl,
      usernames: postUsernames.join(', '),
      numLikes: likeCount,
      postDate: postDate
    };
    photoData.push(pd);

    console.log(pd);

    await sleep(1);

    console.log('Waiting for next btn...');
    const nextBtn = await page.waitForSelector(NEXT_BTN, {timeout: 30 * 1000});
    await nextBtn.click();

    await sleep(1);
  }

  const csvData = stringify(photoData, {header: true});
  fs.writeFileSync('photo_data.csv', csvData);

  await page.goto('https://www.instagram.com/mradatta/');

  const messageBtn = await page.waitForSelector(MESSAGE_BTN, {timeout: 30 * 1000});
  await messageBtn.click();

  const messageTextBox = await page.waitForSelector(MESSAGE_BOX, {timeout: 30 * 1000});
  await messageTextBox.type('Hello from the robot!');

  const messageSendBtn = await page.waitForSelector(MESSAGE_SEND_BTN, {timeout: 30 * 1000});
  await messageSendBtn.click();

  await sleep(3);
  process.exit(0);
})();

async function sleep(time) {
  return new Promise(resolve => {
    setTimeout(resolve, time);
  })
}