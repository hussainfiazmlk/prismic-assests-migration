import fs from "fs";

/* read json file **/
export async function jsonFileReader(filePath) {
  const data = await fs.promises.readFile(filePath, "utf8");

  return JSON.parse(data);
}

/** Save error logs in log file */
export const logErrorToFile = async (filename, message) => {
  try {
    const dirPath = dirPathResolver("errors");

    const logFilePath = `${dirPath}/${filename}.log`;

    // Append the message to the log file with a newline
    await fs.promises.appendFile(logFilePath, `${new Date().toISOString()} - ${message}\n`);
  } catch (error) {
    console.error("Failed to write to log file:", error);
  }
};

export function dirPathResolver(path) {
  const dirPath = `./${path}`;

  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath);
  }

  return dirPath;
}
