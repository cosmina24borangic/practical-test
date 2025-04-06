import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { updateProduct, deleteProduct } from '@/lib/actions/product';

export async function GET(_: Request, { params }: { params: { id: string } }) {
    const id = Number(params.id);

    try {
        const product = await prisma.product.findUnique({
            where: { id },
            include: { tags: true, category: true },
        });

        if (!product) {
            return NextResponse.json({ error: 'Produsul nu a fost găsit.' }, { status: 404 });
        }

        return NextResponse.json(product);
    } catch (error) {
        return NextResponse.json({ error: 'Eroare la preluarea produsului.' }, { status: 500 });
    }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
    const id = Number(params.id);
    const body = await req.json();
    const { name, price, description, categoryId, tagIds } = body;

    if (!name || !price || !description || !categoryId) {
        return NextResponse.json({ error: 'Lipsesc câmpuri obligatorii' }, { status: 400 });
    }

    try {
        const updated = await updateProduct(id, {
            name,
            price,
            description,
            categoryId,
            tagIds,
        });

        return NextResponse.json(updated);
    } catch (err) {
        return NextResponse.json({ error: 'Eroare la actualizare produs' }, { status: 500 });
    }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
    const id = Number(params.id);

    try {
        await deleteProduct(id);
        return NextResponse.json({ message: 'Produs șters cu succes!' });
    } catch (err) {
        return NextResponse.json({ error: 'Eroare la ștergere produs' }, { status: 500 });
    }
}