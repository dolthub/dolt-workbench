const fs = require("fs");
const path = require("path");
const https = require("https");
const zlib = require("zlib");
const { pipeline } = require("stream/promises");
const tar = require("tar");
const AdmZip = require("adm-zip");

// Get the latest version from GitHub API
async function getLatestVersion() {
  return new Promise((resolve, reject) => {
    https
      .get(
        "https://api.github.com/repos/dolthub/dolt/releases/latest",
        {
          headers: { "User-Agent": "Node.js" },
        },
        response => {
          if (response.statusCode !== 200) {
            return reject(
              new Error(`Failed to get latest version: ${response.statusCode}`),
            );
          }

          let data = "";
          response.on("data", chunk => (data += chunk));
          response.on("end", () => {
            try {
              const release = JSON.parse(data);
              resolve(release.tag_name);
            } catch (e) {
              reject(e);
            }
          });
        },
      )
      .on("error", reject);
  });
}

async function getPlatformConfigs(platform, version) {
  const BASE_URL = `https://github.com/dolthub/dolt/releases/download/${version}`;
  switch (platform) {
    case "darwin":
      return [
        {
          url: `${BASE_URL}/dolt-darwin-arm64.tar.gz`,
          dest: path.join(__dirname, "./mac/dolt"),
          extract: async data => extractTarGz(data, "dolt"),
        },
      ];

    case "win32":
      return [
        {
          url: `${BASE_URL}/dolt-windows-amd64.zip`,
          dest: path.join(__dirname, "./appx/dolt.exe"),
          extract: async data => {
            const zip = new AdmZip(data);
            const zipEntries = zip.getEntries();
            const doltEntry = zipEntries.find(e =>
              e.entryName.toLowerCase().endsWith("dolt.exe"),
            );
            if (!doltEntry) throw new Error("dolt.exe not found in ZIP");
            return zip.readFile(doltEntry);
          },
        },
      ];
    case "linux":
      return [
        {
          url: `${BASE_URL}/dolt-linux-arm64.tar.gz`,
          dest: path.join(__dirname, "./linux/dolt-arm64"),
          extract: async data => extractTarGz(data, "dolt"),
        },
        {
          url: `${BASE_URL}/dolt-linux-amd64.tar.gz`,
          dest: path.join(__dirname, "./linux/dolt-x64"),
          extract: async data => extractTarGz(data, "dolt"),
        },
      ];

    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }
}

async function extractTarGz(data, targetFile) {
  return new Promise((resolve, reject) => {
    const gunzip = zlib.createGunzip();
    const extractor = tar.t();
    let found = false;

    extractor.on("entry", entry => {
      if (path.basename(entry.path) === targetFile) {
        found = true;
        const chunks = [];
        entry.on("data", chunk => chunks.push(chunk));
        entry.on("end", () => resolve(Buffer.concat(chunks)));
        entry.on("error", reject);
      } else {
        entry.resume();
      }
    });

    extractor.on("end", () => {
      if (!found) reject(new Error(`${targetFile} not found in tarball`));
    });

    extractor.on("error", reject);

    // Start processing
    const input = new (require("stream").PassThrough)();
    input.end(data);
    pipeline(input, gunzip, extractor).catch(reject);
  });
}

async function downloadFile(url) {
  return new Promise((resolve, reject) => {
    const handleResponse = response => {
      // Handle redirects
      if (
        response.statusCode >= 300 &&
        response.statusCode < 400 &&
        response.headers.location
      ) {
        const redirectUrl = new URL(response.headers.location, url).href;
        console.log(`Redirecting to: ${redirectUrl}`);
        https.get(redirectUrl, handleResponse).on("error", reject);
        return;
      }

      if (response.statusCode !== 200) {
        return reject(
          new Error(
            `Failed to download: ${response.statusCode} ${response.statusMessage}`,
          ),
        );
      }

      const chunks = [];
      response.on("data", chunk => chunks.push(chunk));
      response.on("end", () => resolve(Buffer.concat(chunks)));
    };

    https.get(url, handleResponse).on("error", reject);
  });
}

async function downloadConfig(config, platform) {
  console.log(`Downloading from ${config.url}...`);

  // Create destination directory
  const destDir = path.dirname(config.dest);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  try {
    const data = await downloadFile(config.url);
    const binary = await config.extract(data);

    fs.writeFileSync(config.dest, binary, {
      mode: platform === "win32" ? undefined : 0o755,
    });

    console.log(`Dolt downloaded to ${config.dest}`);
  } catch (error) {
    console.error(
      `Error downloading: ${error instanceof Error ? error.message : error}`,
    );
    process.exit(1);
  }
}

async function downloadDolt(platform) {
  console.log("Getting latest Dolt version...");
  const version = await getLatestVersion();
  console.log(`Using Dolt version: ${version}`);

  const configs = await getPlatformConfigs(platform, version);
  console.log(`Downloading ${configs.length} Dolt binaries for ${platform}...`);

  // Download all binaries sequentially
  for (const config of configs) {
    await downloadConfig(config, platform);
  }
}

// Main execution
const platform = process.argv[2];
if (!platform || !["darwin", "win32", "linux"].includes(platform)) {
  console.error("Usage: ts-node download-dolt.ts <platform>");
  console.error("Supported platforms: darwin, win32, linux");
  process.exit(1);
}

downloadDolt(platform);
