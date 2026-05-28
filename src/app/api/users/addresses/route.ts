import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { addressSchema } from '@/lib/validations';

// GET: User's addresses
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const addresses = await db.getAll(
      `SELECT * FROM addresses WHERE user_id = $1 ORDER BY is_default DESC, created_at DESC`,
      [(session.user as any).id]
    );

    return NextResponse.json({ data: addresses });
  } catch (error) {
    console.error('Addresses fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch addresses' },
      { status: 500 }
    );
  }
}

// POST: Add new address
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validated = addressSchema.parse(body);

    // If this is default, unset others
    if (validated.is_default) {
      await db.execute(
        `UPDATE addresses SET is_default = false WHERE user_id = $1`,
        [(session.user as any).id]
      );
    }

    const address = await db.getOne(
      `INSERT INTO addresses (
        user_id, label, street, city, county, country, postal_code, is_default
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [
        (session.user as any).id,
        validated.label,
        validated.street,
        validated.city,
        validated.county,
        validated.country,
        validated.postal_code,
        validated.is_default || false,
      ]
    );

    return NextResponse.json(
      { data: address, message: 'Address added' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Address creation error:', error);
    return NextResponse.json(
      { error: 'Failed to add address', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
