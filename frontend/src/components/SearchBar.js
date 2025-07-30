import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { searchDesa } from '../services/api';

const SearchBar = ({ onSelectLocation, placeholder = 'Cari desa...' }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const searchRef = useRef(null);
  const resultsRef = useRef(null);

  // Debounce search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.length >= 2) {
        handleSearch(query);
      } else {
        setResults([]);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);  // Handle search
  const handleSearch = async (searchQuery) => {
    if (!searchQuery || searchQuery.length < 2) return;

    setIsLoading(true);
    try {

      const response = await searchDesa(searchQuery);
      
      // Backend mengembalikan {success: true, data: [...]}
      const data = response?.data || [];
      
      setResults(data);
      setShowResults(true);
      setSelectedIndex(-1);
    } catch (error) {
      setResults([]);
      setShowResults(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input change
  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
  };

  // Handle location selection
  const handleSelectLocation = (location) => {
    setQuery(`${location.nama_desa}, ${location.kecamatan}`);
    setShowResults(false);
    setResults([]);
    onSelectLocation(location);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!showResults || results.length === 0) return;

    switch (e.key) {
    case 'ArrowDown':
      e.preventDefault();
      setSelectedIndex(prev => 
        prev < results.length - 1 ? prev + 1 : prev
      );
      break;
    case 'ArrowUp':
      e.preventDefault();
      setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
      break;
    case 'Enter':
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < results.length) {
        handleSelectLocation(results[selectedIndex]);
      }
      break;      case 'Escape':
      setShowResults(false);
      setSelectedIndex(-1);
      break;
    default:
      // No action needed for other keys
      break;
    }
  };

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  return (
    <div ref={searchRef} className="relative w-full max-w-md mx-auto">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length >= 2 && setShowResults(true)}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 text-white placeholder-gray-400 backdrop-blur-sm"
          autoComplete="off"
        />

        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
          </div>
        )}
      </div>

      {/* Search Results */}
      {showResults && (
        <div 
          ref={resultsRef}
          className="absolute z-50 w-full mt-1 bg-gray-800/95 backdrop-blur-sm border border-gray-600 rounded-lg shadow-xl max-h-64 overflow-y-auto"
        >
          {results.length > 0 ? (
            <ul className="py-1">
              {results.map((location, index) => (
                <li
                  key={location.adm4_code}
                  onClick={() => handleSelectLocation(location)}
                  className={`px-4 py-3 cursor-pointer transition-colors duration-150 ${
                    index === selectedIndex
                      ? 'bg-blue-600/50 text-blue-200'
                      : 'hover:bg-gray-700/50 text-white'
                  }`}
                >
                  <div className="flex flex-col">
                    <div className="font-medium">
                      📍 {location.nama_desa}
                    </div>
                    <div className="text-sm text-gray-300">
                      {location.kecamatan}, {location.kabupaten}
                    </div>
                    <div className="text-xs text-gray-400">
                      {location.provinsi} • {location.adm4_code}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : query.length >= 2 && !isLoading ? (
            <div className="px-4 py-3 text-gray-400 text-center">
              🔍 Tidak ada desa ditemukan untuk "{query}"
            </div>
          ) : null}
        </div>
      )}

      {/* Search hint */}
      {query.length > 0 && query.length < 2 && (
        <div className="absolute z-40 w-full mt-1 bg-gray-800/95 backdrop-blur-sm border border-gray-600 rounded-lg shadow-xl">
          <div className="px-4 py-3 text-gray-400 text-sm text-center">
            💡 Ketik minimal 2 karakter untuk mencari desa
          </div>
        </div>
      )}
    </div>
  );
};

SearchBar.propTypes = {
  onSelectLocation: PropTypes.func.isRequired,
  placeholder: PropTypes.string
};

export default SearchBar;
