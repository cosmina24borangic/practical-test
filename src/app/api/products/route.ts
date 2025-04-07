import { NextResponse } from 'next/server';
import { getFilteredProducts } from '@/lib/actions/product';
import { createProduct } from '@/lib/actions/product';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);

    const categoryId = searchParams.get('categoryId');
    const tagIds = searchParams.getAll('tagIds').map(Number);
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') as 'name' | 'price';
    const sortOrder = searchParams.get('sortOrder') as 'asc' | 'desc';

    const products = await getFilteredProducts({
        categoryId: categoryId ? Number(categoryId) : undefined,
        tagIds: tagIds.length ? tagIds : undefined,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        search: search || undefined,
        sortBy,
        sortOrder,
    });

    return NextResponse.json(products);
}

export async function POST(req: Request) {
    const body = await req.json();
    const { name, price, description, categoryId, tagIds } = body;
  
    if (!name || !price || !description || !categoryId) {
        return NextResponse.json({ error: 'Lipsesc câmpuri obligatorii' }, { status: 400 });
    }
  
    const newProduct = await createProduct({
        name,
        price,
        description,
        categoryId,
        tagIds,
    });
  
    return NextResponse.json(newProduct);
}
