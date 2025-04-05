'use server';

import { prisma } from '@lib/prisma';

export async function createCategory(data: {
    name: string;
    parentId?: number;
}) {
    return await prisma.category.create({
        data: {
            name: data.name,
            parentId: data.parentId,
        },
    });
}

export async function getAllCategories() {
    return await prisma.category.findMany({
        include: {
            products: true,
        },
    });
}

export async function updateCategory(id: number, data: {
    name?: string;
    parentId?: number;
}) {
    return await prisma.category.update({
        where: { id },
        data: {
            name: data.name,
            parentId: data.parentId,
        },
    });
}

export async function deleteCategory(id: number) {
    return await prisma.category.delete({
        where: { id },
    });
}

export async function getCategoryTree() {
    const categories = await prisma.category.findMany();

    const map = new Map<number, any>();
    const roots: any[] = [];

    for (const cat of categories) {
        map.set(cat.id, { ...cat, children: [] });
    }

    for (const cat of categories) {
        const node = map.get(cat.id);
        if (cat.parentId) {
            map.get(cat.parentId)?.children.push(node);
        } else {
            roots.push(node);
        }
    }

    return roots;
}
