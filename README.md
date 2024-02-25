# instagram-rpa

This is a small proof of concept of using Puppeteer to automate tasks on Instagram. 
The Instagram API has been increasingly limited over the last few years to the point where it's not possible to do anything
data related via the API.

## Try it out

Clone the code
```
git clone https://github.com/Setfive/instagram-rpa.git
```

Create an .env file
```
cp .env.dist .env
```

You'll need to populate this file with your Instagram username and password:
```
INSTAGRAM_USERNAME=
INSTAGRAM_PASSWORD=
```

Run it!

```
npm start
```

## What it does

The code instruments Puppeteer to do the following:

* Logs you into Instagram
* Declines the offer to save your login info
* Declines notifications
* Visits [#bostonfoodies](https://www.instagram.com/explore/tags/bostonfoodies/)
* Visits the first 25 photos, saves data about each photo, and writes out a CSV to photo_data.csv
* Visits [Ashish's profile](https://www.instagram.com/mradatta/) and sends him a message

## Extend it

To make this "useful", you could extend it to do things like:

* Automatically Like or Comment on photos from specific accounts or tagged with specific hashtags
* Use OpenAI/LLM to automatically message users personalized messages about photos they posted 
* Monitor accounts and send alerts when they post

## Demo video

[![Watch demo video](https://img.youtube.com/vi/ntPdVX9ePe8/maxresdefault.jpg)](https://youtu.be/ntPdVX9ePe8)
