import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

function getArg(flag) {
  const argv = process.argv.slice(2);
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === flag) return argv[i + 1];
    if (arg.startsWith(`${flag}=`)) return arg.slice(flag.length + 1);
  }
  return undefined;
}

function hasFlag(flag) {
  return process.argv.includes(flag);
}

function printHelp() {
  // Keep this simple and copy/paste friendly.
  console.log(`Seed the first admin user (idempotent).

Usage:
  npm run seed:admin -- --email admin@example.com --password 'StrongPass123' --name 'Admin'

Args (or env vars):
  --email     (ADMIN_EMAIL)     required
  --password  (ADMIN_PASSWORD)  required
  --name      (ADMIN_NAME)      optional (default: Admin)
  --role      (ADMIN_ROLE)      optional (default: admin)

Env:
  MONGODB_URI         Mongo connection string
  ADMIN_EMAIL         Admin email
  ADMIN_PASSWORD      Admin password
  ADMIN_NAME          Admin display name
  ADMIN_ROLE          Admin role (default: admin)

Notes:
  - If a user with the email already exists, this script does nothing.
`);
}

if (hasFlag('--help') || hasFlag('-h')) {
  printHelp();
  process.exit(0);
}

function getShorthandEmail() {
  const knownFlags = new Set(['--email', '--password', '--name', '--role', '--help', '-h']);
  const argv = process.argv.slice(2);

  for (const arg of argv) {
    if (!arg.startsWith('--')) continue;
    if (knownFlags.has(arg)) continue;
    if (arg.includes('=')) continue;

    const candidate = arg.slice(2);
    if (candidate.includes('@')) return candidate;
  }
  return undefined;
}

const email = getArg('--email') ?? getShorthandEmail() ?? process.env.ADMIN_EMAIL;
const password = getArg('--password') ?? process.env.ADMIN_PASSWORD;
const name = getArg('--name') ?? process.env.ADMIN_NAME ?? 'Admin';
const role = getArg('--role') ?? process.env.ADMIN_ROLE ?? 'admin';

if (!email || !password) {
  console.error('Missing required --email/--password (or ADMIN_EMAIL/ADMIN_PASSWORD).');
  console.error('Run with --help for usage.');
  process.exit(1);
}

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/landing-page-builder';

const UserSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, required: true, unique: true },
    image: String,
    password: { type: String, select: false },
    role: { type: String, default: 'admin' },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function main() {
  await mongoose.connect(MONGODB_URI, { bufferCommands: false });

  const existing = await User.findOne({ email });
  if (existing) {
    console.log(`Admin seed skipped: user already exists for ${email}`);
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const created = await User.create({ name, email, password: hashedPassword, role });

  console.log(`Admin user created: ${created.email} (role: ${created.role})`);
}

try {
  await main();
} catch (err) {
  console.error('Admin seed failed:', err?.message || err);
  process.exitCode = 1;
} finally {
  try {
    await mongoose.disconnect();
  } catch {
    // ignore
  }
}
