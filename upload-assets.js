import dotenv from "dotenv";
dotenv.config();
import fs from "fs";
import FormData from "form-data";
import axios from "axios";
import { jsonFileReader, logErrorToFile } from "./utils.js";

/* upload asset with metadata  **/
async function uploadAsset(asset) {
  try {
    const filePath = `./media/${asset.id}.${asset.filename.split(".").pop()}`;

    if (!fs.existsSync(filePath)) {
      const message = `File not found: ${filePath}`;
      await logErrorToFile("upload-assets-error", message);
      console.log(message);
    }

    const media = fs.createReadStream(filePath);

    const formData = new FormData();
    formData.append("file", media);

    if (asset?.notes) formData.append("notes", asset.notes);
    if (asset?.credits) formData.append("credits", asset.credits);
    if (asset?.alt) formData.append("alt", asset.alt);

    let url = `https://asset-api.prismic.io/assets`;

    const response = await axios.post(url, formData, {
      headers: {
        repository: process.env.PRISMIC_DESTINATION_REPO,
        Authorization: `Bearer ${process.env.PRISMIC_DESTINATION_TOKEN}`,
        "Content-Type": "multipart/form-data",
        Accept: "application/json",
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error uploading asset:", error);
    return { success: false };
  }
}

/* upload assets **/
async function uploadAssets() {
  const assets = await jsonFileReader("./metadata/assets.json");

  let savedCount = 0;
  for (const asset of assets) {
    try {
      console.log(`start uploading asset with id: ${asset.id}`);
      const response = await uploadAsset(asset);
      savedCount++;
      if (response.success)
        console.log(`asset with id: ${asset.id} successfully uploaded, remaining:  ${assets.length - savedCount}`);
    } catch (error) {
      console.error(`Error uploading ${asset.id}: ${error.message}`);
    }
  }
}

uploadAssets();
