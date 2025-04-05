import { getCategoryTree } from '@lib/actions/category';
import { NextResponse } from 'next/server';

export async function GET() {

    const categories = await getCategoryTree();
    return NextResponse.json(categories);
}