# YouTube Channel Scrape

Easily gather video data from any YouTube channel and convert videos to MP3s—all with just a few commands. This tool allows you to scrape video URLs, titles, and views from a channel's page and export them to a CSV file. From there, you can use a Python script to download the videos as MP3 files.

## Requirements
To get started, you'll need:
- Node.js (for scraping)
- Python 3 (for downloading MP3s)
- `yt-dlp` package (for MP3 conversion)
- Puppeteer (for handling YouTube scraping)

## Usage

### Step 1: Scraping Video Data
Run the scraping tool with the following CLI arguments:

- `-u`: The URL of the YouTube channel’s video page (e.g., `https://www.youtube.com/@channelName/videos`).
- `-n`: (Optional) Number of videos to scrape. If not provided, it will scrape all available videos.
- `-p`: (Optional) Set to `true` to sort by popular videos, or leave it at `false` for the default, which sorts by newest. Defaults to `false`.

Example command:

```bash
node youtube-channel-scrape.js -u "https://www.youtube.com/@channelName/videos" -n 10 -p false
```

This will scrape 10 videos, sorted by the newest first, and save the data to `exports/channelName_youtube_videos.csv`.

### Step 2: Downloading Videos as MP3
Once the CSV is created, you can download the videos as MP3 files:

```bash
python youtube_downloader.py exports/channelName_youtube_videos.csv
```

This script will download each video in the CSV as an MP3 using `yt-dlp` and save them in a folder named after the channel.

## Customization
- Change the number of videos to scrape using the `-n` argument, or omit it to scrape all.
- Use `-p true` to sort by popularity.
- Adjust the output CSV or download folder structure by modifying the script.

## Conclusion
With YouTube Channel Scrape, you can quickly collect video data and convert YouTube content into MP3 format. It's a powerful yet simple solution for managing and downloading videos in bulk.

Created by: [Your Name]
