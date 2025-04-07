'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Select from 'react-select';

interface Category {
  id: number;
  name: string;
  children?: Category[];
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

export default function AddCategoryPage() {

  const router = useRouter();
  const [name, setName] = useState('');
  const [parentId, setParentId] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => {
        if (!res.ok) throw new Error('Nu s-au putut încărca categoriile.');
        return res.json();
      })
      .then(setCategories)
      .catch((err) => setError(err.message));
  }, []);

  const buildCategoryOptions = (cats: Category[], depth = 0): CategoryOption[] =>
    cats.flatMap((cat) => [
      { value: String(cat.id), label: cat.name, depth },
      ...(cat.children ? buildCategoryOptions(cat.children, depth + 1) : [])
    ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (name.trim().length < 2) {
      setError('Numele categoriei trebuie să aibă cel puțin 2 caractere.');
      return;
    }

    try {
      const res = await fetch('/api/categories/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          parentId: parentId ? Number(parentId) : null
        })
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text);
      }

      setSuccess('Categorie adăugată cu succes!');
      setName('');
      setParentId('');
      setTimeout(() => router.push('/'), 1200);
    } catch (err: any) {
      setError('Eroare: ' + err.message);
    }
  };

  return (
    <div className="p-6 max-w-screen-sm mx-auto space-y-6">
      <button
        onClick={() => router.push('/')}
        className="flex items-center gap-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded transition"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Înapoi la produse
      </button>

      <div className="bg-gradient-to-br from-white via-slate-50 to-gray-100 border border-gray-200 shadow rounded-xl p-6">
        <h1 className="text-2xl font-semibold text-center text-gray-800 mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
          Adaugă Categorie
        </h1>

        {error && <div className="text-red-600 font-semibold mb-2">{error}</div>}
        {success && <div className="text-green-600 font-semibold mb-2">{success}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-medium mb-1 text-gray-700">Nume categorie:</label>
            <input
              type="text"
              placeholder="Ex: Televizoare"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="border rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-300 transition"
            />
          </div>

          <div>
            <label className="block font-medium mb-1 text-gray-700">Categorie părinte (opțional):</label>
            <Select
              instanceId="parent-category-select"
              options={buildCategoryOptions(categories)}
              value={buildCategoryOptions(categories).find((opt) => opt.value === parentId) || null}
              onChange={(option) => setParentId(option?.value || '')}
              placeholder="Fără categorie părinte"
              isClearable
              styles={customStyles}
              className="text-sm"
              formatOptionLabel={(e: CategoryOption) => (
                <div
                  style={{
                    paddingLeft: `${e.depth * 16}px`,
                    fontWeight: e.depth === 0 ? 600 : 400,
                    color: e.depth === 0 ? '#1e3a8a' : '#475569',
                    opacity: e.depth > 0 ? 0.85 : 1
                  }}
                >
                  {e.label}
                </div>
              )}
            />
          </div>

          <div className="flex justify-center pt-2">
            <button
              type="submit"
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
            >
              Adaugă categorie
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
