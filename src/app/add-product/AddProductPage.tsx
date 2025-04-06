'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

type Category = {
    id: number;
    name: string;
    children?: Category[];
};

type Tag = {
    id: number;
    name: string;
};

export default function AddProductPage() {

    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [description, setDescription] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [selectedTags, setSelectedTags] = useState<number[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [tags, setTags] = useState<Tag[]>([]);

    const searchParams = useSearchParams();
    const editId = searchParams.get('id');
    const router = useRouter();

    useEffect(() => {
        fetch('/api/categories').then(res => res.json()).then(setCategories);
        fetch('/api/tags').then(res => res.json()).then(setTags);

        if (editId) {
            fetch(`/api/products/${editId}`)
                .then(res => res.json())
                .then(data => {
                    setName(data.name);
                    setPrice(String(data.price));
                    setDescription(data.description);
                    setCategoryId(String(data.categoryId));
                    setSelectedTags(data.tags.map((t: Tag) => t.id));
                });
        }
    }, [editId]);

    const renderOptions = (cats: Category[], depth = 0): React.ReactElement[] => {
        return cats.flatMap(cat => [
            <option key={cat.id} value={cat.id}>
                {'—'.repeat(depth) + ' ' + cat.name}
            </option>,
            ...(cat.children ? renderOptions(cat.children, depth + 1) : []),
        ]);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const payload = {
            name,
            price: parseFloat(price),
            description,
            categoryId: Number(categoryId),
            tagIds: selectedTags,
        };

        const res = await fetch(
            editId ? `/api/products/${editId}` : '/api/products',
            {
                method: editId ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            }
        );

        if (!res.ok) {
            const text = await res.text();
            alert('Eroare: ' + text);
        } else {
            alert(editId ? 'Produs actualizat!' : 'Produs adăugat!');
            router.push('/');
        }
    };

    return (
        <div className="p-6 max-w-xl mx-auto">
            <h1 className="text-xl font-bold mb-4">{editId ? 'Editează Produs' : 'Adaugă Produs'}</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    type="text"
                    placeholder="Nume"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full border rounded p-2"
                />
                <input
                    type="number"
                    placeholder="Preț"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                    className="w-full border rounded p-2"
                />
                <textarea
                    placeholder="Descriere"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    className="w-full border rounded p-2"
                />
                <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    required
                    className="w-full border rounded p-2"
                >
                    <option value="">Alege categorie</option>
                    {renderOptions(categories)}
                </select>
                <select
                    multiple
                    value={selectedTags.map(String)}
                    onChange={(e) => {
                        const selected = Array.from(e.target.selectedOptions, opt => Number(opt.value));
                        setSelectedTags(selected);
                    }}
                    className="w-full border rounded p-2"
                >
                    {tags.map(tag => (
                        <option key={tag.id} value={tag.id}>{tag.name}</option>
                    ))}
                </select>
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
                    {editId ? 'Salvează modificările' : 'Adaugă produs'}
                </button>
            </form>
        </div>
    );
}