import subprocess
import csv
from pathlib import Path
from argparse import ArgumentParser

def download_mp3(csv_file):
    with open(csv_file, newline='') as csvfile:
        reader = csv.DictReader(csvfile)
        rows = list(reader)

    # Process each row
    for row in rows:
        url = row['URL']
        producer = row['Producer']
        downloaded = row['Downloaded']
        folder = f'/your/path/{producer}'

        # Create the directory if it doesn't exist
        Path(folder).mkdir(parents=True, exist_ok=True)
        
        # Download the file if it hasn't been downloaded yet
        if downloaded == "false":
            subprocess.call(['yt-dlp', '-x', '--audio-format', 'mp3', url, '-o', f'{folder}/%(title)s-%(id)s'])

            # Update the 'Downloaded' status to 'true'
            row['Downloaded'] = "true"
    
    # Write the updated rows back to the CSV file
    with open(csv_file, 'w', newline='') as csvfile:
        fieldnames = rows[0].keys()  # Get the fieldnames from the first row
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        
        writer.writeheader()
        writer.writerows(rows)

def main():
    parser = ArgumentParser(description="Download MP3s from YouTube URLs listed in a CSV file.")
    parser.add_argument('-c', '--csv', required=True, help="Path to the CSV file containing URLs and producers.")
    args = parser.parse_args()

    download_mp3(args.csv)

if __name__ == "__main__":
    main()
