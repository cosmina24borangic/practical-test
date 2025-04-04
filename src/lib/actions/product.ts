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