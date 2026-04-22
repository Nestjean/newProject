import React, { useState } from 'react';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';

const SearchBar = ({ onSearch, placeholder = "Rechercher..." }) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(query);
  };

  const handleClear = () => {
    setQuery('');
    if (onSearch) onSearch('');
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className={`relative transition-all duration-300 ${isFocused ? 'scale-105' : ''}`}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="w-80 px-4 py-2 pl-10 pr-10 bg-gray-100 border border-transparent rounded-xl focus:bg-white focus:border-blue-500 focus:outline-none transition-all duration-200"
        />
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        {query && (
          <button type="button" onClick={handleClear} className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <XMarkIcon className="w-5 h-5 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>
    </form>
  );
};

export default SearchBar;