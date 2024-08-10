import dotenv from "dotenv";
import fs from "fs";
import { dirPathResolver } from "./utils.js";

dotenv.config();

/** Save Metadata in json file */
async function saveItemsMetadata(data) {
  // check if metadata directory exists, if not, create metadata directory
  const dirPath = dirPathResolver("metadata");

  const filePath = `${dirPath}/assets-metadata.json`;

  let existingItems = [];

  // Check if the file exists and read existing content
  if (fs.existsSync(filePath)) {
    const existingData = await fs.promises.readFile(filePath, "utf8");
    if (existingData) {
      existingItems = JSON.parse(existingData);
    }
  }

  // Append new data to the existing data
  existingItems.push(...data);

  // Write the combined data back to the file
  await fs.promises.writeFile(filePath, JSON.stringify(existingItems, null, 2));
}

/** Get assets metadata from prismic using prismic assets api */
async function getMetadata() {
  try {
    const limit = process.env.limit;
    let cursor;

    let totalFetched = 0;

    while (true) {
      let url = `https://asset-api.prismic.io/assets?limit=${limit}`;
      if (cursor) {
        url += `&cursor=${cursor}`;
      }

      const response = await fetch(url, {
        method: "GET",
        headers: {
          repository: process.env.PRISMIC_SOURCE_REPO,
          authorization: `Bearer ${process.env.PRISMIC_SOURCE_TOKEN}`,
          origin: url,
        },
      });

      if (!response.ok) {
        throw new Error(response);
      }

      const data = await response.json();
      if (!data?.items?.length) throw new Error("no assets found");

      //  Save the items array to a JSON file
      await saveItemsMetadata(data.items);

      // update page pagination settings
      totalFetched += data.items.length;
      cursor = data.cursor;
      console.log(`${totalFetched} out of ${data.total} assets metadata fetched`);

      // stop loop if all assets have been fetched
      if (totalFetched >= data.total) {
        break;
      }
    }
  } catch (error) {
    console.log(error);
  }
}

getMetadata();
