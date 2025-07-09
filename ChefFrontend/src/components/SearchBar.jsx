import React, { useState } from 'react';
import { searchRecipes } from '../services/recipesServices';

export default function SearchBar({ onSearchResults, onLoading, onError, onSearchQuery, onClearError }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      onError(new Error('INVALID_INPUT'));
      return;
    }

    setIsSearching(true);
    onLoading(true);
    
    if (onClearError) {
      onClearError();
    }
    onSearchQuery(searchQuery);

    try {
      const results = await searchRecipes(searchQuery, 8);
      onSearchResults(results);
    } catch (error) {
      onError(error);
    } finally {
      setIsSearching(false);
      onLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch(e);
    }
  };

  return (
    <div className="search-container" style={{
      marginBottom: '20px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '10px'
    }}>
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Search for recipes..."
        style={{
          padding: '12px 16px',
          fontSize: '16px',
          border: '2px solid #ddd',
          borderRadius: '25px',
          width: '300px',
          outline: 'none',
          transition: 'border-color 0.3s ease'
        }}
        onFocus={(e) => e.target.style.borderColor = '#007bff'}
        onBlur={(e) => e.target.style.borderColor = '#ddd'}
      />
      <button
        onClick={handleSearch}
        disabled={isSearching}
        style={{
          padding: '12px 24px',
          fontSize: '16px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '25px',
          cursor: isSearching ? 'not-allowed' : 'pointer',
          opacity: isSearching ? 0.7 : 1,
          transition: 'background-color 0.3s ease'
        }}
        onMouseEnter={(e) => !isSearching && (e.target.style.backgroundColor = '#0056b3')}
        onMouseLeave={(e) => !isSearching && (e.target.style.backgroundColor = '#007bff')}
      >
        {isSearching ? 'Searching...' : 'Search'}
      </button>
    </div>
  );
} 