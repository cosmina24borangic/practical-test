import { NextResponse } from 'next/server';
import { getFilteredProducts } from '@/lib/actions/product';

export async function GET(req: Request) {

    const { searchParams } = new URL(req.url);

    const categoryId = searchParams.get('categoryId');
    const tagIds = searchParams.getAll('tagIds').map(Number);
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') as 'name' | 'price' | 'createdAt';
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