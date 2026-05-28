import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { addressSchema } from '@/lib/validations';

// PUT: Update address
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validated = addressSchema.parse(body);

    // Verify ownership
    const existing = await db.getOne(
      `SELECT id FROM addresses WHERE id = $1 AND user_id = $2`,
      [params.id, (session.user as any).id]
    );

    if (!existing) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 });
    }

    // If setting as default, unset others
    if (validated.is_default) {
      await db.execute(
        `UPDATE addresses SET is_default = false WHERE user_id = $1 AND id != $2`,
        [(session.user as any).id, params.id]
      );
    }

    const address = await db.getOne(
      `UPDATE addresses SET
        label = COALESCE($1, label),
        street = COALESCE($2, street),
        city = COALESCE($3, city),
        county = COALESCE($4, county),
        country = COALESCE($5, country),
        postal_code = COALESCE($6, postal_code),
        is_default = COALESCE($7, is_default)
       WHERE id = $8
       RETURNING *`,
      [
        validated.label,
        validated.street,
        validated.city,
        validated.county,
        validated.country,
        validated.postal_code,
        validated.is_default,
        params.id,
      ]
    );

    return NextResponse.json({ data: address });
  } catch (error) {
    console.error('Address update error:', error);
    return NextResponse.json(
      { error: 'Failed to update address' },
      { status: 500 }
    );
  }
}

// DELETE: Remove address
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const address = await db.getOne(
      `SELECT id FROM addresses WHERE id = $1 AND user_id = $2`,
      [params.id, (session.user as any).id]
    );

    if (!address) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 });
    }

    await db.execute('DELETE FROM addresses WHERE id = $1', [params.id]);

    return NextResponse.json({ message: 'Address deleted' });
  } catch (error) {
    console.error('Address delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete address' },
      { status: 500 }
    );
  }
}
