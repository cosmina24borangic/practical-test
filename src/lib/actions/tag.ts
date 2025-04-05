'use server';

import { prisma } from '@lib/prisma';

export async function createTag(name: string) {
    return await prisma.tag.create({
        data: { name },
    });
}

export async function getAllTags() {
    return await prisma.tag.findMany();
}

export async function updateTag(id: number, name: string) {
    return await prisma.tag.update({
        where: { id },
        data: { name },
    });
}

export async function deleteTag(id: number) {
    return await prisma.tag.delete({
        where: { id },
    });
}
