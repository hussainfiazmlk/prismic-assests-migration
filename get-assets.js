import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { dirPathResolver, jsonFileReader, logErrorToFile } from "./utils.js";

dotenv.config();

/** download asset media file and save it in media directory */
async function downloadMedia(url, filename, id) {
  try {
    // check if media directory exists, if not, create media directory
    const dirPath = dirPathResolver("media");

    // fetch asset using asset url, if any error occurs, log it in error log file
    const response = await fetch(url);
    if (!response.ok) {
      const message = `${response.statusText}: Failed to fetch asset with id: ${id} and url: ${url}`;
      await logErrorToFile("get-assets-error", message);
      console.error(message);
      return { success: false };
    }

    // create asset file buffer
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Write the buffer to a file
    await fs.promises.writeFile(path.join(dirPath, `${id}.${filename.split(".").pop()}`), buffer);

    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false };
  }
}

/** add asset metadata in assets file if media file downloaded successfully */
async function saveAsset(asset) {
  try {
    const { url, filename, id } = asset;

    // first download media file
    const response = await downloadMedia(url, filename, id);
    if (!response.success) return { success: false };

    // check if metadata directory exists, if not, create metadata directory
    const dirPath = dirPathResolver("metadata");

    const filePath = `${dirPath}/assets.json`;

    let existingItems = [];

    // Check if the file exists and read existing content
    if (fs.existsSync(filePath)) {
      const existingData = await fs.promises.readFile(filePath, "utf8");
      if (existingData) {
        existingItems = JSON.parse(existingData);
      }
    }

    // Append new data to the existing data
    existingItems.push(asset);

    // Write the combined data back to the file
    await fs.promises.writeFile(filePath, JSON.stringify(existingItems, null, 2));

    return { success: true };
  } catch (error) {
    console.log(error);

    return { success: false };
  }
}

/* save assets file and assets metadata in locally **/
async function getAssets() {
  const items = await jsonFileReader("./metadata/assets-metadata.json");

  let savedCount = 0;
  for (const item of items) {
    try {
      console.log(`start downloading asset with id: ${item.id}`);
      const response = await saveAsset(item);
      savedCount++;
      if (response.success)
        console.log(`asset with id: ${item.id} successfully saved, remaining: ${items.length - savedCount}`);
    } catch (error) {
      console.error(`Error saving ${item.id}: ${error.message}`);
    }
  }
}

getAssets();
