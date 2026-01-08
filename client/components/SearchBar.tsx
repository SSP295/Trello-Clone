'use client';

import { useState } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';
import { searchCards } from '@/lib/api';
import { Card, List } from '@/types';
import { useRouter } from 'next/navigation';
import { useBoardStore } from '@/store/boardStore';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Card[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  // Get the current board from store
  const { board } = useBoardStore();

  const handleSearch = async (searchQuery: string) => {
    setQuery(searchQuery);
    if (searchQuery.trim()) {
      try {
        const response = await searchCards({ q: searchQuery });
        setResults(response.data);
        setIsOpen(true);
      } catch (error) {
        console.error('Error searching:', error);
      }
    } else {
      setResults([]);
      setIsOpen(false);
    }
  };

  const handleCardClick = (card: Card) => {
    if (card.list?.boardId) {
      router.push(`/board/${card.list.boardId}`);
      setIsOpen(false);
      setQuery('');
    }
  };

  // Helper to get board title safely
  const getBoardTitle = () => {
    return board?.title || 'Unknown Board';
  };

  return (
    <div className="relative w-full max-w-md animate-fadeIn">
      <div className="relative">
        <FiSearch
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 transition-all duration-200 group-hover:scale-110"
          size={18}
        />
        <input
          type="text"
          value={query}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            handleSearch(e.target.value)
          }
          placeholder="Search cards..."
          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 hover:border-blue-400 group"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setResults([]);
              setIsOpen(false);
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <FiX size={18} />
          </button>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 max-h-96 overflow-y-auto z-50 animate-scaleIn">
          {results.map((card, index) => (
            <button
              key={card.id}
              onClick={() => handleCardClick(card)}
              className="w-full text-left p-3 hover:bg-gray-100 border-b border-gray-100 last:border-b-0 transition-all duration-200 hover:scale-[1.02] animate-fadeIn"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="font-medium text-gray-800 group-hover:text-blue-600 transition-colors duration-200">
                {card.title}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                in {card.list?.title || 'Unknown'} • {getBoardTitle()}
              </div>
            </button>
          ))}
        </div>
      )}

      {isOpen && query && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 p-4 text-center text-gray-500 z-50">
          No cards found
        </div>
      )}
    </div>
  );
}
