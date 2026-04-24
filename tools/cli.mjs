#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
//  MockAPI Dev Tools
//  Usage:
//    npm run tools              — interactive menu
//    npm run tools dev          — start backend + frontend
//    npm run tools migrate      — run SQL migrations
//    npm run tools build        — production build
//    npm run tools status       — env health check
// ─────────────────────────────────────────────────────────────────────────────

import { chalk, echo } from 'zx';
import { spawn }       from 'child_process';
import * as fs         from 'fs';
import * as path       from 'path';
import * as readline   from 'readline';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT      = path.join(__dirname, '..');
const BACKEND   = path.join(ROOT, 'backend');
const FRONTEND  = path.join(ROOT, 'frontend');

// ── .env loader ──────────────────────────────────────────────────────────────

function loadEnv() {
  const envPath = path.join(ROOT, '.env');
  if (!fs.existsSync(envPath)) return;

  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let val   = line.slice(eq + 1).trim();
    if (/^(['"]).*\1$/.test(val)) val = val.slice(1, -1);
    // don't override vars already set in the shell
    if (!(key in process.env)) process.env[key] = val;
  }
}

loadEnv();

// ── helpers ───────────────────────────────────────────────────────────────────

const box = (title) => {
  const line = '─'.repeat(title.length + 4);
  echo``;
  echo`  ╭${line}╮`;
  echo`  │  ${chalk.bold(title)}  │`;
  echo`  ╰${line}╯`;
  echo``;
};

const ok  = (msg) => echo`  ${chalk.green('✓')} ${msg}`;
const err = (msg) => echo`  ${chalk.red('✗')} ${msg}`;
const dim = (msg) => echo`  ${chalk.dim(msg)}`;

/** Spawn a process and prefix every line of its output with a coloured label. */
function prefixed(label, color, cmd, cwd) {
  const tag  = chalk[color].bold(`[${label}]`);
  const proc = spawn(cmd, { cwd, shell: true, stdio: ['inherit', 'pipe', 'pipe'] });

  const writeLine = (line) => {
    if (line.trim()) process.stdout.write(`${tag} ${line}\n`);
  };

  proc.stdout.on('data', (d) => d.toString().split('\n').forEach(writeLine));
  proc.stderr.on('data', (d) => d.toString().split('\n').forEach((l) => writeLine(chalk.dim(l))));

  proc.on('exit', (code) => {
    if (code !== 0 && code !== null)
      echo`${tag} ${chalk.red(`process exited with code ${code}`)}`;
  });

  return proc;
}

/** Run a command with inherited stdio (full output). Returns exit code. */
function run(cmd, cwd = ROOT) {
  return new Promise((resolve) => {
    spawn(cmd, { cwd, shell: true, stdio: 'inherit' }).on('exit', resolve);
  });
}

/** Arrow-key interactive menu. Returns the selected key. */
async function selectMenu(items) {
  const keys = Object.keys(items);
  let idx = 0;

  process.stdin.setRawMode(true);
  readline.emitKeypressEvents(process.stdin);

  // initial render
  for (const [k, desc] of Object.entries(items))
    process.stdout.write(`  ${chalk.cyan(k.padEnd(10))} ${desc}\n`);

  const redraw = () => {
    process.stdout.write(`\x1b[${keys.length}A`);
    for (let i = 0; i < keys.length; i++) {
      const k    = keys[i];
      const desc = items[k];
      const line = i === idx
        ? `  ${chalk.bgWhite.black(` ${k} `)} ${desc}`
        : `  ${chalk.cyan(k.padEnd(10))} ${desc}`;
      process.stdout.write(`\r\x1b[K${line}\n`);
    }
  };

  return new Promise((resolve) => {
    process.stdin.on('keypress', (_, key) => {
      if (!key) return;
      if (key.name === 'up')                        { idx = (idx - 1 + keys.length) % keys.length; redraw(); }
      if (key.name === 'down')                      { idx = (idx + 1) % keys.length; redraw(); }
      if (key.name === 'return' || key.name === 'enter') {
        process.stdin.setRawMode(false);
        process.stdin.pause();
        echo``;
        resolve(keys[idx]);
      }
      if (key.name === 'q' || (key.ctrl && key.name === 'c')) {
        process.stdin.setRawMode(false);
        process.stdin.pause();
        process.exit(0);
      }
    });
  });
}

// ── commands ──────────────────────────────────────────────────────────────────

async function cmdDev() {
  box('dev — starting backend + frontend');

  if (!process.env.DATABASE_URL) {
    err('DATABASE_URL is not set.');
    dim('Add it to .env in the project root or export it before running.');
    dim('Example .env:');
    dim('  DATABASE_URL=postgres://user:pass@localhost:5432/mockapi?sslmode=disable');
    dim('  JWT_SECRET=change-me');
    echo``;
    process.exit(1);
  }

  dim('Press Ctrl+C to stop all services.');
  echo``;

  const procs = [
    prefixed('backend',  'blue',  'go run ./cmd/server', BACKEND),
    prefixed('frontend', 'green', 'npm run dev',          FRONTEND),
  ];

  const cleanup = (sig) => {
    echo``;
    dim(`Caught ${sig}, shutting down…`);
    procs.forEach((p) => { try { p.kill('SIGTERM'); } catch {} });
    setTimeout(() => process.exit(0), 600);
  };

  process.on('SIGINT',  () => cleanup('SIGINT'));
  process.on('SIGTERM', () => cleanup('SIGTERM'));

  // wait until a child process exits unexpectedly
  await Promise.race(
    procs.map((p) => new Promise((resolve) => p.on('exit', resolve)))
  );
}

async function cmdBuild() {
  box('build — frontend production bundle');

  const code = await run('npm run build', FRONTEND);
  if (code === 0) ok('Build complete → frontend/dist/');
  else            { err('Build failed'); process.exit(1); }
}

async function cmdMigrate() {
  box('migrate — apply SQL migrations');

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    err('DATABASE_URL is not set.');
    dim('Set it in .env or export it before running:');
    dim('  DATABASE_URL=postgres://... npm run tools migrate');
    process.exit(1);
  }

  const migsDir = path.join(BACKEND, 'migrations');
  const files   = fs.readdirSync(migsDir).filter((f) => f.endsWith('.sql')).sort();

  dim(`Found ${files.length} migration file(s) in backend/migrations/`);
  echo``;

  for (const file of files) {
    const filePath = path.join(migsDir, file);
    process.stdout.write(`  ${chalk.cyan('→')} ${file} … `);

    await new Promise((resolve, reject) => {
      let errout = '';
      const proc = spawn(`psql "${dbUrl}" -f "${filePath}"`, {
        shell: true, stdio: ['ignore', 'pipe', 'pipe'],
      });
      proc.stderr.on('data', (d) => (errout += d));
      proc.on('exit', (code) => {
        if (code === 0) { process.stdout.write(chalk.green('done\n')); resolve(); }
        else            { process.stdout.write(chalk.red('FAILED\n')); if (errout) dim(errout.trim()); reject(new Error(`Failed: ${file}`)); }
      });
    });
  }

  echo``;
  ok('All migrations applied successfully.');
}

async function cmdStatus() {
  box('status — environment health check');

  const checks = [
    { label: 'Go installed',   cmd: 'go version' },
    { label: 'Node installed', cmd: 'node --version' },
    { label: 'psql available', cmd: 'psql --version' },
    { label: 'backend/go.mod', file: path.join(BACKEND, 'go.mod') },
    { label: 'frontend/dist/', file: path.join(FRONTEND, 'dist') },
    { label: '.env file',      file: path.join(ROOT, '.env') },
  ];

  for (const check of checks) {
    if (check.cmd) {
      await new Promise((resolve) => {
        let out = '';
        const proc = spawn(check.cmd, { shell: true, stdio: ['ignore', 'pipe', 'pipe'] });
        proc.stdout.on('data', (d) => (out += d));
        proc.on('exit', (code) => {
          if (code === 0) ok(`${check.label.padEnd(18)} ${chalk.dim(out.trim().split('\n')[0])}`);
          else            err(`${check.label.padEnd(18)} ${chalk.dim('not found')}`);
          resolve();
        });
      });
    } else {
      if (fs.existsSync(check.file)) ok(check.label);
      else                           err(`${check.label.padEnd(18)} ${chalk.dim('missing')}`);
    }
  }

  if (process.env.DATABASE_URL)
    ok(`DATABASE_URL        ${chalk.dim(process.env.DATABASE_URL.replace(/:([^@]+)@/, ':***@'))}`);
  else
    err(`DATABASE_URL        ${chalk.dim('not set')}`);

  if (process.env.JWT_SECRET) ok(`JWT_SECRET          ${chalk.dim('set')}`);
  else                        err(`JWT_SECRET          ${chalk.dim('not set')}`);

  echo``;
}

async function showHelp() {
  box('MockAPI Dev Tools');

  const cmds = {
    dev:     'Start backend (Go) + frontend (Rollup) in watch mode',
    build:   'Build frontend for production → frontend/dist/',
    migrate: 'Run SQL migrations against $DATABASE_URL',
    status:  'Check dev environment (go, node, psql, .env, dist)',
  };

  echo`  ${chalk.dim('Commands')}`;
  for (const [name, desc] of Object.entries(cmds))
    echo`    ${chalk.cyan(name.padEnd(10))} ${desc}`;

  echo``;
  echo`  ${chalk.dim('Usage')}`;
  echo`    ${chalk.white('npm run tools')}             interactive menu`;
  echo`    ${chalk.white('npm run tools dev')}         start dev mode`;
  echo`    ${chalk.white('npm run tools migrate')}     run migrations`;
  echo`    ${chalk.white('npm run tools build')}       production build`;
  echo`    ${chalk.white('npm run tools status')}      environment check`;
  echo``;
  echo`  ${chalk.dim('Env vars (put in .env at project root)')}`;
  echo`    ${chalk.cyan('DATABASE_URL')}  postgres://user:pass@localhost:5432/mockapi?sslmode=disable`;
  echo`    ${chalk.cyan('JWT_SECRET')}    your-secret-key`;
  echo`    ${chalk.cyan('PORT')}          8080  ${chalk.dim('(optional, default: 8080)')}`;
  echo``;
}

async function interactiveMenu() {
  box('MockAPI Dev Tools');
  echo`  ${chalk.dim('↑/↓ navigate  Enter select  q quit')}`;
  echo``;

  const items = {
    dev:     'Start backend + frontend in dev mode',
    build:   'Build frontend for production',
    migrate: 'Run database migrations',
    status:  'Check dev environment',
    help:    'Show usage & env vars reference',
  };

  const selected = await selectMenu(items);

  const dispatch = { dev: cmdDev, build: cmdBuild, migrate: cmdMigrate, status: cmdStatus, help: showHelp };
  await dispatch[selected]();
}

// ── entrypoint (IIFE — avoids top-level await warning on early exit) ──────────

(async () => {
  const [cmd] = process.argv.slice(2);

  const dispatch = {
    dev:     cmdDev,
    build:   cmdBuild,
    migrate: cmdMigrate,
    status:  cmdStatus,
    help:    showHelp,
  };

  if (!cmd) {
    if (process.stdin.isTTY && process.stdout.isTTY) await interactiveMenu();
    else                                              await showHelp();
  } else if (dispatch[cmd]) {
    await dispatch[cmd]();
  } else {
    err(`Unknown command: ${chalk.bold(cmd)}`);
    await showHelp();
    process.exit(1);
  }
})().catch((e) => {
  echo`  ${chalk.red('Error:')} ${e.message}`;
  process.exit(1);
});
