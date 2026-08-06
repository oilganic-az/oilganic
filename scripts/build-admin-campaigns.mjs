import fs from "node:fs";
import path from "node:path";

const repositoryRoot = process.cwd();

const sourcePath = path.join(
  repositoryRoot,
  "content",
  "campaigns.json"
);

const outputPath = path.join(
  repositoryRoot,
  "src",
  "data",
  "campaigns.generated.json"
);

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function readJson(filePath) {
  assert(
    fs.existsSync(filePath),
    `Fayl tapılmadı: ${path.relative(repositoryRoot, filePath)}`
  );

  const text = fs
    .readFileSync(filePath, "utf8")
    .replace(/^\uFEFF/, "");

  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error(
      `JSON parse xətası: ${path.relative(
        repositoryRoot,
        filePath
      )} | ${error.message}`
    );
  }
}

function validateOptionalString(value, fieldName) {
  assert(
    value === undefined ||
      (typeof value === "string" && value.trim().length > 0),
    `${fieldName} string olmalıdır.`
  );
}

const document = readJson(sourcePath);

assert(
  document?.schemaVersion === 1,
  "campaigns.json schemaVersion 1 olmalıdır."
);

assert(
  Array.isArray(document.campaigns),
  "campaigns.json daxilində campaigns massivi yoxdur."
);

const ids = new Set();

for (const [index, campaign] of document.campaigns.entries()) {
  const label = `campaigns[${index}]`;

  assert(
    campaign && typeof campaign === "object",
    `${label} obyekt deyil.`
  );

  assert(
    typeof campaign.id === "string" &&
      campaign.id.trim().length > 0,
    `${label}.id yoxdur.`
  );

  assert(
    !ids.has(campaign.id),
    `Təkrarlanan campaign ID: ${campaign.id}`
  );

  assert(
    typeof campaign.title === "string" &&
      campaign.title.trim().length > 0,
    `${label}.title yoxdur.`
  );

  assert(
    typeof campaign.conditions === "string" &&
      campaign.conditions.trim().length > 0,
    `${label}.conditions yoxdur.`
  );

  assert(
    typeof campaign.isActive === "boolean",
    `${label}.isActive boolean deyil.`
  );

  validateOptionalString(
    campaign.startDate,
    `${label}.startDate`
  );

  validateOptionalString(
    campaign.endDate,
    `${label}.endDate`
  );

  validateOptionalString(
    campaign.imageSrc,
    `${label}.imageSrc`
  );

  ids.add(campaign.id);
}

const output = {
  schemaVersion: 1,
  campaigns: document.campaigns,
};

fs.mkdirSync(
  path.dirname(outputPath),
  { recursive: true }
);

fs.writeFileSync(
  outputPath,
  `${JSON.stringify(output, null, 2)}\n`,
  "utf8"
);

console.log(
  JSON.stringify(
    {
      status: "PASS",
      campaigns: output.campaigns.length,
      output: path.relative(repositoryRoot, outputPath),
    },
    null,
    2
  )
);