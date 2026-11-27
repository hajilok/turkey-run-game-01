// Featherbreak: The Great Thanksgiving Escape — make.fun turkey-run-game-01 hand-in entrypoint.
// Runs on Node 22 (standard library only): copies game/ and screenshots/ to the output directory
// and emits the deterministic canonical dossier.json via the unmodified kit library.

import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const REPO_ROOT = fileURLToPath(new URL('.', import.meta.url));
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

const GATE_CAPS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
} as const;

function copyTreeClean(src: string, dst: string): void {
  if (existsSync(dst)) rmSync(dst, { recursive: true, force: true });
  cpSync(src, dst, { recursive: true });
}

function runHandIn(): void {
  mkdirSync(OUTPUT_DIR, { recursive: true });
  copyTreeClean(join(REPO_ROOT, 'game'), join(OUTPUT_DIR, 'game'));
  const shotsSrc = join(REPO_ROOT, 'screenshots');
  const shotsDst = join(OUTPUT_DIR, 'screenshots');
  if (existsSync(shotsSrc)) {
    copyTreeClean(shotsSrc, shotsDst);
  } else {
    mkdirSync(shotsDst, { recursive: true });
  }
  const dossierBytes = buildDossier(OUTPUT_DIR, GATE_CAPS);
  writeFileSync(join(OUTPUT_DIR, 'dossier.json'), dossierBytes);
}

runHandIn();
