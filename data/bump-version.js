// 更新 data/version.js 的版本號跟時間戳記,遊戲畫面右下角會顯示這個。
// 用法: node data/bump-version.js [major|minor|patch]  (預設 patch)
'use strict';
const fs = require('fs');
const path = require('path');

const OUTPUT_PATH = path.join(__dirname, 'version.js');
const bumpKind = process.argv[2] || 'patch';

function readCurrent() {
  if (!fs.existsSync(OUTPUT_PATH)) return { version: '0.0.0', updatedAt: '' };
  const src = fs.readFileSync(OUTPUT_PATH, 'utf8');
  const match = src.match(/version:\s*['"]v?([\d.]+)['"]/);
  return { version: match ? match[1] : '0.0.0' };
}

function bump(version, kind) {
  const [major, minor, patch] = version.split('.').map(n => parseInt(n, 10) || 0);
  if (kind === 'major') return `${major + 1}.0.0`;
  if (kind === 'minor') return `${major}.${minor + 1}.0`;
  return `${major}.${minor}.${patch + 1}`;
}

const current = readCurrent();
const nextVersion = bump(current.version, bumpKind);
const now = new Date();
const updatedAt = now.toLocaleString('zh-TW', {
  timeZone: 'Asia/Taipei', year: 'numeric', month: '2-digit', day: '2-digit',
  hour: '2-digit', minute: '2-digit', hour12: false,
}).replace(/\//g, '-');

const js = `// 自動產生,勿手動編輯。重新產生: node data/bump-version.js [major|minor|patch]\nconst APP_VERSION = { version: 'v${nextVersion}', updatedAt: ${JSON.stringify(updatedAt)} };\n`;
fs.writeFileSync(OUTPUT_PATH, js);
console.log(`已更新: v${nextVersion} @ ${updatedAt}`);
