
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { User } from '@/models/User';
import bcrypt from 'bcryptjs';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email');
  const password = searchParams.get('password');
  const secret = searchParams.get('secret');

  // Basic security to prevent random access
  if (secret !== 'SUPERADMIN_INIT_2026') {
    return NextResponse.json({ error: 'Unauthorized: Invalid setup secret' }, { status: 401 });
  }

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
  }

  try {
    await connectDB();

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      // Promote existing user
      existingUser.role = 'superadmin';
      await existingUser.save();
      return NextResponse.json({
        message: `Existing user ${email} promoted to superadmin.`,
        user: { email: existingUser.email, role: existingUser.role }
      });
    } else {
      // Create new superadmin
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await User.create({
        name: 'System SuperAdmin',
        email,
        password: hashedPassword,
        role: 'superadmin'
      });
      return NextResponse.json({
        message: `New superadmin created: ${email}`,
        user: { email: newUser.email, role: newUser.role }
      });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
