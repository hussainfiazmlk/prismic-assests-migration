# Prismic Asset Migration

Make sure you have Node.js 20 or the latest version installed.

Install dependencies using `npm install`.

Make sure you add all source and destination environment variables in the `.env` file. Check the `.env.example` file for more information.

### Commands

- **Get Prismic Assets Metadata:**  
  Run `npm run getMetadata` to download all Prismic assets metadata and save it in a JSON file named `assets-metadata.json` inside the `metadata` directory.

- **Download Assets Files:**  
  Run `npm run getAssets` to download all Prismic assets media files and save them in a directory named `media`. This also updates the assets metadata with the file paths.

- **Upload Assets to a New Prismic Repository:**  
  Run `npm run uploadAssets` to read local assets files and upload the assets media along with related assets metadata to the Prismic repository.
