import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { compare, hash } from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { currentPassword, newPassword, confirmPassword } = await request.json();

    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json({ message: 'All fields are required' }, { status: 400 });
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json({ message: 'New passwords do not match' }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ message: 'New password must be at least 8 characters' }, { status: 400 });
    }

    // Fetch user
    const user = await prisma.user.findUnique({ where: { id: session.user.id } });

    if (!user || !user.password) {
      return NextResponse.json({ message: 'User not found or no password set' }, { status: 404 });
    }

    const isMatch = await compare(currentPassword, user.password);

    if (!isMatch) {
      return NextResponse.json({ message: 'Current password is incorrect' }, { status: 400 });
    }

    const hashed = await hash(newPassword, 12);

    await prisma.user.update({ where: { id: session.user.id }, data: { password: hashed } });

    return NextResponse.json({ message: 'Password updated' });
  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json({ message: 'Failed to change password' }, { status: 500 });
  }
}
