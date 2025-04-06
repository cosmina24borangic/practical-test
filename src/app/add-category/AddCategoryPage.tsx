'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Category {
  id: number;
  name: string;
  children?: Category[];
}

export default function AddCategoryPage() {
    
  const router = useRouter();
  const [name, setName] = useState('');
  const [parentId, setParentId] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(setCategories);
  }, []);

  const renderOptions = (cats: Category[], depth = 0): React.ReactElement[] => {
    return cats.flatMap((cat) => [
      <option key={cat.id} value={cat.id}>
        {'—'.repeat(depth) + ' ' + cat.name}
      </option>,
      ...(cat.children ? renderOptions(cat.children, depth + 1) : []),
    ]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch('/api/categories/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        parentId: parentId ? Number(parentId) : null,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      alert('Eroare: ' + text);
    } else {
      alert('Categorie adăugată cu succes!');
      router.push('/add-product'); 
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Adaugă Categorie</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Nume categorie"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full border rounded p-2"
        />
        <select
          value={parentId}
          onChange={(e) => setParentId(e.target.value)}
          className="w-full border rounded p-2"
        >
          <option value="">Fără categorie părinte</option>
          {renderOptions(categories)}
        </select>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Adaugă categorie
        </button>
      </form>
    </div>
  );
}