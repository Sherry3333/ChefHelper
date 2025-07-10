import React, { useState } from 'react';
import { searchRecipes } from '../services/recipesServices';

export default function SearchBar({ onSearchResults, onLoading, onError, onSearchQuery, onClearError, className }) {
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
    <form className={className ? `${className} search-bar-form` : 'search-bar-form'} onSubmit={handleSearch}>
      <input
        type="text"
        placeholder="Search for recipes..."
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
        className="search-bar-input"
      />
      <button type="submit" disabled={isSearching} 
        className="search-bar-btn">
        {isSearching ? 'Searching...' : 'Search'}
      </button>
    </form>
  );
} 