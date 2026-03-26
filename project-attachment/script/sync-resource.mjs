/**
 * npm publish 전: project-resource/template → 저장소 루트 resource/ 복사 (배포 tarball에 포함)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..');
const src = path.join(repoRoot, 'project-resource', 'template');
const dest = path.join(repoRoot, 'resource');

if (!fs.existsSync(src)) {
  console.error('sync-resource: 소스가 없습니다:', src);
  process.exit(1);
}

fs.rmSync(dest, { recursive: true, force: true });
fs.cpSync(src, dest, { recursive: true });
console.log('sync-resource: 복사 완료', src, '→', dest);
