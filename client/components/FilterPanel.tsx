'use client';

import { useState, useEffect } from 'react';
import { FiFilter, FiX } from 'react-icons/fi';
import { searchCards } from '@/lib/api';
import { Card, Label, User } from '@/types';
import { useBoardStore } from '@/store/boardStore';
import { useRouter } from 'next/navigation';

interface FilterPanelProps {
  boardId: string;
  onFilterChange: (cards: Card[]) => void;
}

export default function FilterPanel({ boardId, onFilterChange }: FilterPanelProps) {
  const { labels, users } = useBoardStore();
  const [selectedLabel, setSelectedLabel] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [filteredCards, setFilteredCards] = useState<Card[]>([]);

  useEffect(() => {
    applyFilters();
  }, [selectedLabel, selectedUser, selectedDate, boardId]);

  const applyFilters = async () => {
    try {
      const params: any = { boardId };
      if (selectedLabel) params.labelId = selectedLabel;
      if (selectedUser) params.userId = selectedUser;
      if (selectedDate) params.dueDate = selectedDate;

      const response = await searchCards(params);
      setFilteredCards(response.data);
      onFilterChange(response.data);
    } catch (error) {
      console.error('Error filtering cards:', error);
    }
  };

  const clearFilters = () => {
    setSelectedLabel('');
    setSelectedUser('');
    setSelectedDate('');
  };

  const hasActiveFilters = selectedLabel || selectedUser || selectedDate;

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-700 flex items-center gap-2">
          <FiFilter size={18} />
          Filters
        </h3>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <FiX size={16} />
            Clear
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
          <select
            value={selectedLabel}
            onChange={(e) => setSelectedLabel(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Labels</option>
            {labels.map((label) => (
              <option key={label.id} value={label.id}>
                {label.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Member</label>
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Members</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {hasActiveFilters && (
        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredCards.length} card(s)
        </div>
      )}
    </div>
  );
}
