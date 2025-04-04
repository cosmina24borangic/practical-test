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
  