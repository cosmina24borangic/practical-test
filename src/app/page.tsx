'use client';

import React, { useEffect, useState } from 'react';

interface Category {
  id: number;
  name: string;
  children?: Category[];
}

interface Tag {
  id: number;
  name: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  category: Category;
  tags: Tag[];
}

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [search, setSearch] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<string>('asc');

  useEffect(() => {
    fetch('/api/categories').then(res => res.json()).then(setCategories);
    fetch('/api/tags').then(res => res.json()).then(setTags);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedCategory) params.append('categoryId', selectedCategory);
    if (selectedTags.length > 0) selectedTags.forEach(tag => params.append('tagIds', String(tag)));
    if (minPrice) params.append('minPrice', minPrice);
    if (maxPrice) params.append('maxPrice', maxPrice);
    if (search) params.append('search', search);
    if (sortBy) params.append('sortBy', sortBy);
    if (sortOrder) params.append('sortOrder', sortOrder);

    fetch(`/api/products?${params.toString()}`)
      .then(res => res.json())
      .then(setProducts);
  }, [selectedCategory, selectedTags, minPrice, maxPrice, search, sortBy, sortOrder]);

  const renderOptions = (cats: Category[], depth = 0): React.ReactElement[] => {
    return cats.flatMap((cat) => [
      <option key={cat.id} value={cat.id}>
        {'—'.repeat(depth) + ' ' + cat.name}
      </option>,
      ...(cat.children ? renderOptions(cat.children, depth + 1) : []),
    ]);
  };

  return (
    <div className="p-4 space-y-6">
      <div>
        <label htmlFor="category" className="block font-medium">Selectează categoria:</label>
        <select
          id="category"
          className="border rounded p-2 w-full"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">Toate categoriile</option>
          {renderOptions(categories)}
        </select>
      </div>

      <div>
        <label htmlFor="tags" className="block font-medium">Filtrează după taguri:</label>
        <select
          id="tags"
          multiple
          className="border rounded p-2 w-full"
          value={selectedTags.map(String)}
          onChange={(e) => {
            const selected = Array.from(e.target.selectedOptions, option => Number(option.value));
            setSelectedTags(selected);
          }}
        >
          {tags.map(tag => (
            <option key={tag.id} value={tag.id}>{tag.name}</option>
          ))}
        </select>
      </div>

      <div className="flex gap-2">
        <input
          type="number"
          placeholder="Preț minim"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          className="border rounded p-2 w-full"
        />
        <input
          type="number"
          placeholder="Preț maxim"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          className="border rounded p-2 w-full"
        />
      </div>

      <div>
        <input
          type="text"
          placeholder="Caută produse..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded p-2 w-full"
        />
      </div>

      <div className="flex gap-2">
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="border rounded p-2 w-full">
          <option value="">Sortează după</option>
          <option value="name">Nume</option>
          <option value="price">Preț</option>
          <option value="createdAt">Dată</option>
        </select>
        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="border rounded p-2 w-full">
          <option value="asc">Ascendent</option>
          <option value="desc">Descendent</option>
        </select>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {products.map(product => (
          <div key={product.id} className="border rounded p-4 shadow">
            <h3 className="font-bold text-lg">{product.name}</h3>
            <p className="text-sm text-gray-500">{product.category.name}</p>
            <p>{product.description}</p>
            <p className="font-semibold">{product.price} RON</p>
            <div className="flex gap-2 flex-wrap mt-2">
              {product.tags.map(tag => (
                <span key={tag.id} className="text-xs bg-gray-200 rounded px-2 py-1">{tag.name}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
