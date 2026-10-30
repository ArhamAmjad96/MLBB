// download_mlbb_assets.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const targetDir = path.resolve(__dirname, 'client/public/heroes/mlbb');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

async function run() {
  console.log('Fetching hero manifest from Ceplin03/database-mlbb...');
  const res = await fetch('https://raw.githubusercontent.com/Ceplin03/database-mlbb.Mobile-Legends-Bang-Bang/master/hero.json');
  const heroes = await res.json();
  console.log(`Found ${heroes.length} heroes. Starting parallel download into ${targetDir}...`);

  let downloaded = 0;
  let skipped = 0;
  let failed = 0;

  // Process in batches of 10
  const batchSize = 10;
  for (let i = 0; i < heroes.length; i += batchSize) {
    const batch = heroes.slice(i, i + batchSize);
    await Promise.all(batch.map(async (hero) => {
      const imgFileName = hero['images-hero'];
      if (!imgFileName) return;
      
      const filePath = path.join(targetDir, imgFileName);
      if (fs.existsSync(filePath) && fs.statSync(filePath).size > 1000) {
        skipped++;
        return;
      }

      const imgUrl = `https://cdn.jsdelivr.net/gh/Ceplin03/database-mlbb.Mobile-Legends-Bang-Bang@master/images-hero/${encodeURIComponent(imgFileName)}`;
      try {
        const imgRes = await fetch(imgUrl);
        if (imgRes.ok) {
          const buffer = Buffer.from(await imgRes.arrayBuffer());
          fs.writeFileSync(filePath, buffer);
          downloaded++;
        } else {
          console.warn(`Failed to download ${imgFileName} (${imgRes.status})`);
          failed++;
        }
      } catch (err) {
        console.warn(`Error downloading ${imgFileName}:`, err.message);
        failed++;
      }
    }));
  }

  console.log(`Download finished! Downloaded: ${downloaded}, Skipped: ${skipped}, Failed: ${failed}`);
}

run().catch(console.error);
