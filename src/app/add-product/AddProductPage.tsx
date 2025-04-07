'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Select from 'react-select';

interface Category {
  id: number;
  name: string;
  children?: Category[];
}

interface Tag {
  id: number;
  name: string;
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
  }),
  multiValue: (base: any) => ({
    ...base,
    backgroundColor: '#dbeafe',
    borderRadius: '9999px',
    padding: '0 6px'
  }),
  multiValueLabel: (base: any) => ({
    ...base,
    color: '#1e3a8a',
    fontWeight: 500
  }),
  multiValueRemove: (base: any) => ({
    ...base,
    color: '#1e3a8a',
    ':hover': { backgroundColor: '#bfdbfe', color: '#1e3a8a' }
  })
};

export default function AddProductPage() {

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const editId = searchParams.get('id');
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catsRes, tagsRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/tags'),
        ]);

        if (!catsRes.ok || !tagsRes.ok) throw new Error('Eroare la încărcarea datelor.');

        setCategories(await catsRes.json());
        setTags(await tagsRes.json());
      } catch (err: any) {
        setError(err.message);
      }
    };

    fetchData();

    if (editId) {
      fetch(`/api/products/${editId}`)
        .then(res => res.json())
        .then(data => {
          setName(data.name);
          setPrice(String(data.price));
          setDescription(data.description);
          setCategoryId(String(data.categoryId));
          setSelectedTags(data.tags.map((t: Tag) => t.id));
        })
        .catch(err => setError(err.message));
    }
  }, [editId]);

  const buildCategoryOptions = (cats: Category[], depth = 0): CategoryOption[] =>
    cats.flatMap(cat => [
      { value: String(cat.id), label: cat.name, depth },
      ...(cat.children ? buildCategoryOptions(cat.children, depth + 1) : [])
    ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (name.trim().length < 2) return setError('Numele trebuie să aibă cel puțin 2 caractere.');
    if (!price || isNaN(Number(price)) || Number(price) <= 0) return setError('Prețul trebuie să fie un număr pozitiv.');
    if (description.trim().length < 5) return setError('Descrierea trebuie să conțină cel puțin 5 caractere.');

    const payload = {
      name,
      price: parseFloat(price),
      description,
      categoryId: Number(categoryId),
      tagIds: selectedTags,
    };

    try {
      const res = await fetch(editId ? `/api/products/${editId}` : '/api/products', {
        method: editId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(await res.text());

      setSuccess(editId ? 'Produs actualizat cu succes!' : 'Produs adăugat cu succes!');
      if (!editId) {
        setName('');
        setPrice('');
        setDescription('');
        setCategoryId('');
        setSelectedTags([]);
      }
      setTimeout(() => router.push('/'), 1500);
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
        <h1 className="text-2xl font-semibold text-center text-gray-800 mb-6">
          {editId ? 'Editează Produs' : 'Adaugă Produs'}
        </h1>

        {error && <div className="text-red-600 font-semibold mb-2">{error}</div>}
        {success && <div className="text-green-600 font-semibold mb-2">{success}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Nume produs"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="border rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-300 transition"
          />
          <input
            type="number"
            placeholder="Preț"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            className="border rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-300 transition"
          />
          <textarea
            placeholder="Descriere"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className="border rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-300 transition"
          />

          <Select
            instanceId="category-select"
            options={buildCategoryOptions(categories)}
            value={buildCategoryOptions(categories).find(opt => opt.value === categoryId) || null}
            onChange={(opt) => setCategoryId(opt?.value || '')}
            placeholder="Alege categorie"
            isClearable
            styles={customStyles}
            className="text-sm"
            formatOptionLabel={(e: CategoryOption) => (
              <div style={{
                paddingLeft: `${e.depth * 16}px`,
                fontWeight: e.depth === 0 ? 600 : 400,
                color: e.depth === 0 ? '#1e3a8a' : '#475569',
                opacity: e.depth > 0 ? 0.85 : 1
              }}>
                {e.label}
              </div>
            )}
          />

          <div>
            <label className="block font-medium mb-1 text-gray-700">Taguri:</label>
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => {
                const isSelected = selectedTags.includes(tag.id);
                return (
                  <span
                    key={tag.id}
                    onClick={() =>
                      setSelectedTags(prev =>
                        isSelected ? prev.filter(id => id !== tag.id) : [...prev, tag.id]
                      )
                    }
                    className={`flex items-center gap-1 cursor-pointer px-3 py-1 rounded-full text-sm font-medium ${isSelected ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'
                      }`}
                  >
                    {tag.name}
                    {isSelected && (
                      <span
                        title="Elimină"
                        onClick={e => {
                          e.stopPropagation();
                          setSelectedTags(prev => prev.filter(id => id !== tag.id));
                        }}
                        className="ml-1 w-5 h-5 flex items-center justify-center rounded-full text-xs border border-transparent hover:border-red-400 hover:bg-red-100 hover:text-red-600 transition"
                      >
                        ✕
                      </span>
                    )}
                  </span>
                );
              })}
            </div>
          </div>

          <div className="flex justify-center pt-2">
            <button
              type="submit"
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
            >
              {editId ? 'Salvează modificările' : 'Adaugă produs'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
