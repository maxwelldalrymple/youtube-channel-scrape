const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const { program } = require("commander");

// CLI setup
program
  .option("-u, --url <url>", "YouTube channel URL")
  .option("-n, --number <number>", "Number of videos to parse", parseInt)
  .option("-p, --popular <boolean>", "Click on the 'Popular' button", "false")
  .parse(process.argv);

const { url, number, popular } = program.opts();

if (!url) {
  console.error("Please provide a valid YouTube channel URL.");
  process.exit(1);
}

const channelName = url.split("@")[1].split("/")[0].toLowerCase();
const videoLimit = number || Infinity; // Default to no limit if not specified
const clickPopular = popular === "true"; // Convert string to boolean
const filePath = path.join(
  __dirname,
  `exports/${channelName}_youtube_videos.csv`
);

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: null, // Make the window fill the whole screen
    args: ["--start-maximized"], // Maximize the browser window
  });
  const page = await browser.newPage();

  await page.goto(url, { waitUntil: "networkidle2" });

  // Click on the "Popular" button if the `--popular` argument is true
  if (clickPopular) {
    try {
      const popularButtonSelector =
        'yt-chip-cloud-chip-renderer[role="tab"] yt-formatted-string[title="Popular"]';
      await page.waitForSelector(popularButtonSelector, { timeout: 5000 });
      await page.click(popularButtonSelector);

      // Wait for the page to update after clicking
      await page.waitForFunction(
        (selector) => {
          const button = document.querySelector(selector);
          return button && button.getAttribute("aria-selected") === "true";
        },
        { timeout: 5000 },
        popularButtonSelector
      );
    } catch (error) {
      console.log("Popular button not found, continuing without sorting...");
    }
  }

  // Initialize CSV file
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, `Producer,Title,URL,Views,Downloaded\n`);
  }

  // Read existing video links from CSV
  const existingData = fs.readFileSync(filePath, "utf-8");
  const existingLinks = new Set(
    existingData
      .split("\n")
      .slice(1) // Skip the header
      .map((line) => line.split(",")[2]) // Extract video links
      .filter((link) => link) // Remove empty links
  );

  // Initialize variables
  let videoCount = 0;

  while (videoCount < videoLimit) {
    // console.log("Loading more data..."); // turn on if debugging

    // Scroll down
    await page.evaluate(() => {
      let totalHeight = 0;
      const distance = 100;
      const scrollDelay = 100;

      const scroll = () => {
        window.scrollBy(0, distance);
        totalHeight += distance;
        if (totalHeight < document.body.scrollHeight) {
          setTimeout(scroll, scrollDelay);
        }
      };
      scroll();
    });

    // Wait for new videos to load
    await page.waitForFunction(
      () =>
        document.documentElement.scrollHeight >
        window.innerHeight + window.scrollY,
      { timeout: 10000 }
    );

    // Extract video details
    const newVideos = await page.evaluate(() => {
      const videoElements = Array.from(
        document.querySelectorAll("div#dismissible")
      );
      return videoElements.map((video) => {
        const videoTitleElement = video.querySelector("a#video-title-link");
        const videoTitle = videoTitleElement
          ? videoTitleElement.innerText.trim()
          : null;
        const videoLink = videoTitleElement
          ? `https://www.youtube.com${videoTitleElement.getAttribute("href")}`
          : null;

        const viewsElement = video.querySelector(
          "span.inline-metadata-item.style-scope.ytd-video-meta-block"
        );
        const views = viewsElement ? viewsElement.innerText.trim() : null;

        return { videoTitle, videoLink, views };
      });
    });

    // Save new videos if they are not already in the set and are not already in the CSV
    newVideos.forEach((video) => {
      if (!existingLinks.has(video.videoLink) && videoCount < videoLimit) {
        existingLinks.add(video.videoLink);
        fs.appendFileSync(
          filePath,
          `${channelName},${video.videoTitle},${video.videoLink},${video.views},false\n`
        );
        videoCount++;
        console.log(`Saved video: ${video.videoTitle}, Count: ${videoCount}`);
      }
    });

    // If no new videos are loaded and we've collected enough videos, break the loop
    if (newVideos.length === 0 || videoCount >= videoLimit) break;
  }

  console.log(`Data saved to ${filePath}`);
  console.log(`${videoCount} videos have been saved.`);
  await browser.close();
})();
