'use server';

import { prisma } from '@lib/prisma';

export async function createProduct(data: {
  name: string;
  price: number;
  description: string;
  categoryId: number;
  tagIds?: number[];
}) {
  return await prisma.product.create({
    data: {
      name: data.name,
      price: data.price,
      description: data.description,
      categoryId: data.categoryId,
      tags: data.tagIds
        ? { connect: data.tagIds.map((id) => ({ id })) }
        : undefined,
    },
  });
}

export async function getAllProducts() {
  return await prisma.product.findMany({
    include: {
      category: true,
      tags: true,
    },
  });
}

export async function deleteProduct(id: number) {
  return await prisma.product.delete({
    where: { id },
  });
}

export async function updateProduct(id: number, data: {
  name?: string;
  price?: number;
  description?: string;
  categoryId?: number;
  tagIds?: number[];
}) {
  return await prisma.product.update({
    where: { id },
    data: {
      name: data.name,
      price: data.price,
      description: data.description,
      categoryId: data.categoryId,
      tags: data.tagIds
        ? {
            set: data.tagIds.map((id) => ({ id })),
          }
        : undefined,
    },
  });
}

async function getAllCategoryIds(categoryId: number): Promise<number[]> {
  const categories = await prisma.category.findMany();

  const collectIds = (id: number): number[] => {
    const children = categories.filter(cat => cat.parentId === id);
    return [id, ...children.flatMap(child => collectIds(child.id))];
  };

  return collectIds(categoryId);
}

export async function getFilteredProducts({
  categoryId,
  tagIds,
  minPrice,
  maxPrice,
  search,
  sortBy,
  sortOrder,
}: {
  categoryId?: number;
  tagIds?: number[];
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sortBy?: 'name' | 'price' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}) {
  const filters: any = {};

  if (categoryId) {
    const categoryIds = await getAllCategoryIds(categoryId);
    filters.categoryId = { in: categoryIds };
  }

  if (tagIds?.length) {
    filters.tags = {
      some: {
        id: {
          in: tagIds,
        },
      },
    };
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    filters.price = {};
    if (minPrice !== undefined) filters.price.gte = minPrice;
    if (maxPrice !== undefined) filters.price.lte = maxPrice;
  }

  if (search) {
    filters.name = {
      contains: search,
    };
  }

  return await prisma.product.findMany({
    where: filters,
    orderBy: sortBy
      ? {
          [sortBy]: sortOrder || 'asc',
        }
      : undefined,
    include: {
      category: true,
      tags: true,
    },
  });
}
