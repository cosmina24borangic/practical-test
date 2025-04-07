import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { updateProduct, deleteProduct } from '@/lib/actions/product'

function extractIdFromUrl(request: NextRequest): number | null {
  const url = new URL(request.url)
  const idString = url.pathname.split('/').pop()
  const id = Number(idString)
  return isNaN(id) ? null : id
}

export async function GET(request: NextRequest) {
  const id = extractIdFromUrl(request)
  if (id === null) {
    return NextResponse.json({ error: 'ID invalid' }, { status: 400 })
  }

  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: { tags: true, category: true },
    })

    if (!product) {
      return NextResponse.json({ error: 'Produsul nu a fost găsit.' }, { status: 404 })
    }

    return NextResponse.json(product)
  } catch (error) {
    return NextResponse.json({ error: 'Eroare la preluarea produsului.' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const id = extractIdFromUrl(request)
  if (id === null) {
    return NextResponse.json({ error: 'ID invalid' }, { status: 400 })
  }

  const body = await request.json()
  const { name, price, description, categoryId, tagIds } = body

  if (!name || !price || !description || !categoryId) {
    return NextResponse.json({ error: 'Lipsesc câmpuri obligatorii' }, { status: 400 })
  }

  try {
    const updated = await updateProduct(id, {
      name,
      price,
      description,
      categoryId,
      tagIds,
    })

    return NextResponse.json(updated)
  } catch (err) {
    return NextResponse.json({ error: 'Eroare la actualizare produs' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const id = extractIdFromUrl(request)
  if (id === null) {
    return NextResponse.json({ error: 'ID invalid' }, { status: 400 })
  }

  try {
    await deleteProduct(id)
    return NextResponse.json({ message: 'Produs șters cu succes!' })
  } catch (err) {
    return NextResponse.json({ error: 'Eroare la ștergere produs' }, { status: 500 })
  }
}
