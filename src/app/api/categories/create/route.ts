import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, parentId } = body;

        if (!name) {
            return NextResponse.json({ error: 'Numele categoriei este obligatoriu.' }, { status: 400 });
        }

        const newCategory = await prisma.category.create({
            data: {
                name,
                parentId: parentId || null,
            },
        });

        return NextResponse.json(newCategory);
    } catch (err) {
        console.error('[CATEGORY_CREATE_ERROR]', err);
        return NextResponse.json({ error: 'Eroare la crearea categoriei.' }, { status: 500 });
    }
}
