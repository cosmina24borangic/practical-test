'use client';

import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import { FiSearch } from 'react-icons/fi';

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

interface CategoryOption {
    value: string;
    label: string;
    depth: number;
}

const customStyles = {
    control: (base: any) => ({
        ...base,
        borderRadius: '0.75rem',
        padding: '2px 4px',
        borderColor: '#cbd5e1',
        fontSize: '0.9rem',
        boxShadow: 'none',
        '&:hover': {
            borderColor: '#6366f1'
        }
    }),
    menu: (base: any) => ({
        ...base,
        zIndex: 100,
        borderRadius: '0.75rem',
        boxShadow: '0 6px 15px rgba(0,0,0,0.08)',
        position: 'absolute',
        width: '100%'
    }),
    menuList: (base: any) => ({
        ...base,
        maxHeight: '265px',
        overflowY: 'auto'
    }),
    option: (base: any, state: any) => ({
        ...base,
        backgroundColor: state.isFocused ? '#eef2ff' : 'white',
        color: '#1e293b',
        fontSize: '0.9rem',
        paddingTop: 10,
        paddingBottom: 10,
        paddingLeft: 12,
        borderLeft: state.isSelected ? '3px solid #6366f1' : '3px solid transparent',
        transition: 'all 0.2s ease-in-out'
    }),
    singleValue: (base: any) => ({
        ...base,
        color: '#1e3a8a',
        fontWeight: 500
    })
};

export default function HomePage() {
    
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [products, setProducts] = useState<Product[]>([]);
    const [tags, setTags] = useState<Tag[]>([]);
    const [selectedTags, setSelectedTags] = useState<number[]>([]);
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState('');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

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

        setIsLoading(true);
        fetch(`/api/products?${params.toString()}`)
            .then(res => {
                if (!res.ok) throw new Error('Eroare la încărcarea produselor.');
                return res.json();
            })
            .then(setProducts)
            .catch(() => setError('Eroare la încărcarea produselor.'))
            .finally(() => setIsLoading(false));
    }, [selectedCategory, selectedTags, minPrice, maxPrice, search, sortBy, sortOrder]);

    const buildCategoryOptions = (cats: Category[], depth = 0): CategoryOption[] =>
        cats.flatMap(cat => [
            { value: String(cat.id), label: cat.name, depth },
            ...(cat.children ? buildCategoryOptions(cat.children, depth + 1) : [])
        ]);

    const toggleTag = (tagId: number) => {
        setSelectedTags(prev =>
            prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
        );
    };

    const handleEdit = (id: number) => {
        window.location.href = `/add-product?id=${id}`;
    };

    const handleDelete = async (id: number) => {
        if (confirm('Sigur vrei să ștergi acest produs?')) {
            const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
            if (res.ok) setProducts(prev => prev.filter(p => p.id !== id));
            else setError('Eroare la ștergerea produsului.');
        }
    };

    const validateNumber = (value: string) => !value || !isNaN(Number(value));

    return (
        <div className="p-6 max-w-screen-xl mx-auto space-y-10">
            {error && <div className="text-red-600 font-semibold">{error}</div>}

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight mb-1">
                        Produsele noastre
                    </h1>
                    <p className="text-gray-500 text-sm">Descoperă toate produsele disponibile în magazin.</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-2 w-full sm:w-auto">
                    <a
                        href="/add-category"
                        className="bg-indigo-600 text-white w-full sm:w-auto text-center px-5 py-2 rounded-lg hover:bg-indigo-700 transition"
                    >
                        + Adaugă categorie
                    </a>
                    <a
                        href="/add-product"
                        className="bg-emerald-600 text-white w-full sm:w-auto text-center px-5 py-2 rounded-lg hover:bg-emerald-700 transition"
                    >
                        + Adaugă produs
                    </a>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 bg-gradient-to-br from-white via-slate-50 to-gray-100 border border-gray-200 shadow rounded-xl p-6">
                <div className="space-y-4">
                    <div>
                        <label className="block font-medium mb-1 text-gray-700">Selectează categoria:</label>
                        <Select
                            instanceId="category-select"
                            options={buildCategoryOptions(categories)}
                            value={buildCategoryOptions(categories).find(opt => opt.value === selectedCategory) || null}
                            onChange={(selectedOption) => setSelectedCategory(selectedOption?.value || '')}
                            placeholder="Toate categoriile"
                            isClearable
                            className="text-sm"
                            formatOptionLabel={(option: CategoryOption) => (
                                <div style={{
                                    paddingLeft: `${option.depth * 16}px`,
                                    fontWeight: option.depth === 0 ? 600 : 400,
                                    color: option.depth === 0 ? '#1e3a8a' : '#475569',
                                    opacity: option.depth > 0 ? 0.85 : 1
                                }}>
                                    {option.label}
                                </div>
                            )}
                            styles={customStyles}
                        />
                    </div>

                    <div>
                        <label className="block font-medium mb-1 text-gray-700">Filtrează după taguri:</label>
                        <div className="flex flex-wrap gap-2">
                            {tags.map(tag => {
                                const isSelected = selectedTags.includes(tag.id);
                                return (
                                    <span
                                        key={tag.id}
                                        onClick={() => toggleTag(tag.id)}
                                        className={`flex items-center gap-1 cursor-pointer px-3 py-1 rounded-full text-sm font-medium transition ${isSelected ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'}`}
                                    >
                                        {tag.name}
                                        {isSelected && (
                                            <span
                                                title="Elimină"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedTags(selectedTags.filter(id => id !== tag.id));
                                                }}
                                                className="ml-1 w-5 h-5 flex items-center justify-center rounded-full text-xs border hover:border-red-400 hover:bg-red-100 hover:text-red-600 transition"
                                            >
                                                ✕
                                            </span>
                                        )}
                                    </span>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="relative w-full">
                        <input
                            type="text"
                            placeholder="Caută produse..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10 pr-4 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 transition text-sm"
                        />
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    </div>

                    <div className="flex gap-2">
                        <input
                            type="number"
                            placeholder="Preț minim"
                            value={minPrice}
                            onChange={(e) => validateNumber(e.target.value) && setMinPrice(e.target.value)}
                            className="border rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-300 transition"
                        />
                        <input
                            type="number"
                            placeholder="Preț maxim"
                            value={maxPrice}
                            onChange={(e) => validateNumber(e.target.value) && setMaxPrice(e.target.value)}
                            className="border rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-300 transition"
                        />
                    </div>

                    <div className="flex gap-2">
                        <Select
                            instanceId="sortby-select"
                            options={[{ value: 'name', label: 'Nume' }, { value: 'price', label: 'Preț' }]}
                            value={sortBy ? { value: sortBy, label: sortBy === 'name' ? 'Nume' : 'Preț' } : null}
                            onChange={(option) => setSortBy(option?.value || '')}
                            placeholder="Sortează după"
                            className="text-sm w-full"
                            styles={customStyles}
                        />
                        <Select
                            instanceId="sortorder-select"
                            options={[{ value: 'asc', label: 'Ascendent' }, { value: 'desc', label: 'Descendent' }]}
                            value={{ value: sortOrder, label: sortOrder === 'asc' ? 'Ascendent' : 'Descendent' }}
                            onChange={(option) => setSortOrder(option?.value as 'asc' | 'desc')}
                            className="text-sm w-full"
                            styles={customStyles}
                        />
                    </div>
                </div>
            </div>

            <hr className="border-t border-gray-200" />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
                {isLoading ? (
                    <div className="col-span-full flex justify-center py-12">
                        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : products.length === 0 ? (
                    <div className="col-span-full text-center text-gray-500 text-lg py-12">
                        Nu am găsit produse după filtrele selectate.
                    </div>
                ) : (
                    products.map(product => (
                        <div key={product.id} className="bg-white rounded-xl border shadow-sm hover:shadow-lg hover:-translate-y-1 transition transform p-5 flex flex-col justify-between">
                            <div>
                                <h3 className="font-semibold text-lg mb-1 text-indigo-700">{product.name}</h3>
                                <p className="text-sm text-gray-500 mb-2 italic">{product.category.name}</p>
                                <p className="text-sm mb-2">{product.description}</p>
                                <p className="font-bold text-gray-800">{product.price} RON</p>
                                <div className="flex gap-2 flex-wrap mt-2">
                                    {product.tags.map(tag => (
                                        <span key={tag.id} className="text-xs bg-indigo-100 text-indigo-700 font-medium px-2 py-1 rounded-full">
                                            {tag.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div className="flex gap-4 mt-4 text-sm">
                                <button onClick={() => handleEdit(product.id)} className="text-indigo-600 hover:underline">Editează</button>
                                <button onClick={() => handleDelete(product.id)} className="text-red-600 hover:underline">Șterge</button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
