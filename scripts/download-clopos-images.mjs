import fs from "node:fs/promises";
import path from "node:path";

const inputFile =
  process.argv[2] ??
  "oilganic-products-with-images.json";

const outputDirectory =
  process.argv[3] ??
  "public/images/products";

const concurrency = 4;
const delayBetweenRequestsMs = 150;

const sleep = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function downloadImage(row) {
  const outputPath = path.join(
    outputDirectory,
    row.filename
  );

  if (await fileExists(outputPath)) {
    console.log(
      `⏭️ Mövcuddur: ${row.filename}`
    );

    return {
      product: row.product,
      imageUrl: row.imageUrl,
      localPath: `/${outputPath.replaceAll(
        "\\",
        "/"
      ).replace(/^public\//, "")}`,
      status: "existing",
    };
  }

  const response = await fetch(row.imageUrl, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 Oilganic Image Importer",
      Referer:
        "https://oilganicshop.clopos.menu/",
      Accept:
        "image/avif,image/webp,image/png,image/jpeg,*/*",
    },
  });

  if (!response.ok) {
    throw new Error(
      `${response.status} ${response.statusText}`
    );
  }

  const contentType =
    response.headers.get("content-type") ?? "";

  if (!contentType.startsWith("image/")) {
    throw new Error(
      `Şəkil olmayan cavab: ${contentType}`
    );
  }

  const arrayBuffer =
    await response.arrayBuffer();

  await fs.writeFile(
    outputPath,
    Buffer.from(arrayBuffer)
  );

  console.log(
    `✅ ${row.product} → ${row.filename}`
  );

  await sleep(delayBetweenRequestsMs);

  return {
    product: row.product,
    imageUrl: row.imageUrl,
    localPath: `/${outputPath.replaceAll(
      "\\",
      "/"
    ).replace(/^public\//, "")}`,
    status: "downloaded",
  };
}

async function runPool(rows) {
  const results = new Array(rows.length);
  let currentIndex = 0;

  async function worker() {
    while (currentIndex < rows.length) {
      const index = currentIndex++;

      try {
        results[index] =
          await downloadImage(rows[index]);
      } catch (error) {
        console.error(
          `❌ ${rows[index].product}:`,
          error.message
        );

        results[index] = {
          product: rows[index].product,
          imageUrl: rows[index].imageUrl,
          localPath: null,
          status: "failed",
          error: error.message,
        };
      }
    }
  }

  const workers = Array.from(
    {
      length: Math.min(
        concurrency,
        rows.length
      ),
    },
    () => worker()
  );

  await Promise.all(workers);

  return results;
}

async function main() {
  const raw = await fs.readFile(
    inputFile,
    "utf8"
  );

  const parsed = JSON.parse(raw);

  const rows = Array.isArray(parsed)
    ? parsed
    : parsed.products;

  if (!Array.isArray(rows)) {
    throw new Error(
      "JSON daxilində məhsul array-i tapılmadı."
    );
  }

  const validRows = rows.filter(
    (row) =>
      row &&
      typeof row.product === "string" &&
      typeof row.imageUrl === "string" &&
      typeof row.filename === "string"
  );

  await fs.mkdir(outputDirectory, {
    recursive: true,
  });

  console.log(
    `📥 ${validRows.length} şəkil yüklənəcək...`
  );

  const results =
    await runPool(validRows);

  const successful = results.filter(
    (result) =>
      result?.status === "downloaded" ||
      result?.status === "existing"
  );

  const failed = results.filter(
    (result) =>
      result?.status === "failed"
  );

  const imageMap = Object.fromEntries(
    successful.map((result) => [
      result.product,
      result.localPath,
    ])
  );

  await fs.writeFile(
    path.join(
      outputDirectory,
      "image-map.json"
    ),
    JSON.stringify(imageMap, null, 2),
    "utf8"
  );

  await fs.writeFile(
    path.join(
      outputDirectory,
      "download-report.json"
    ),
    JSON.stringify(results, null, 2),
    "utf8"
  );

  console.log("");
  console.log(
    `✅ Uğurlu: ${successful.length}`
  );
  console.log(`❌ Uğursuz: ${failed.length}`);
  console.log(
    `📁 Folder: ${outputDirectory}`
  );
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exitCode = 1;
});