// src/components/SearchBar.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    const value = e.target.value;
    setQuery(value);
    if (value.length < 2) { setShowResults(false); return; }
    setLoading(true);
    try {
      const [trajetsRes, vehiculesRes, chauffeursRes] = await Promise.all([
        fetch(`http://localhost:8000/api/trajets/?search=${value}`).then(r => r.json()),
        fetch(`http://localhost:8000/api/vehicules/?search=${value}`).then(r => r.json()),
        fetch(`http://localhost:8000/api/utilisateurs/?search=${value}&role=chauffeur`).then(r => r.json())
      ]);
      setResults([
        ...trajetsRes.map(t => ({ id: t.id, type: 'trajet', title: `${t.origine} → ${t.destination}`, subtitle: `${t.date} - ${t.nombre_passagers} passagers`, link: `/dashboard/trajets/${t.id}` })),
        ...vehiculesRes.map(v => ({ id: v.id, type: 'vehicule', title: `${v.marque} ${v.modele}`, subtitle: v.immatriculation, link: `/dashboard/vehicules/${v.id}` })),
        ...chauffeursRes.map(c => ({ id: c.id, type: 'chauffeur', title: `${c.first_name} ${c.last_name}`, subtitle: `@${c.username}`, link: `/dashboard/chauffeurs/${c.id}` }))
      ]);
      setShowResults(true);
    } catch (error) { console.error('Erreur recherche:', error); } 
    finally { setLoading(false); }
  };

  return (
    <div className="relative">
      <div className="relative">
        <input type="text" value={query} onChange={handleSearch} onBlur={() => setTimeout(() => setShowResults(false), 200)} placeholder="Rechercher un trajet, véhicule, chauffeur..." className="w-80 px-4 py-2 pl-10 pr-4 bg-gray-100 border border-transparent rounded-xl focus:bg-white focus:border-red-500 focus:outline-none transition" />
        <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        {query && <button onClick={() => { setQuery(''); setShowResults(false); }} className="absolute right-3 top-1/2 transform -translate-y-1/2"><svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>}
      </div>
      {showResults && results.length > 0 && (<div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-lg border z-50"><div className="p-3 border-b"><p className="text-sm font-medium">Résultats ({results.length})</p></div><div className="max-h-80 overflow-y-auto">{results.map(r => (<div key={r.id} onClick={() => { navigate(r.link); setShowResults(false); setQuery(''); }} className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-0"><div className="flex items-center gap-2"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${r.type === 'trajet' ? 'bg-blue-100 text-blue-700' : r.type === 'vehicule' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'}`}>{r.type}</span><p className="text-sm font-medium">{r.title}</p></div><p className="text-xs text-gray-500 mt-1">{r.subtitle}</p></div>))}</div></div>)}
    </div>
  );
};

export default SearchBar;