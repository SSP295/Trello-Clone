'use client';

import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FiMoreVertical, FiPlus } from 'react-icons/fi';
import CardComponent from './CardComponent';
import { useBoardStore } from '@/store/boardStore';
import { createCard, deleteList, updateList } from '@/lib/api';
import { List, Card } from '@/types';

interface ListComponentProps {
  list: List;
  onCardClick: (card: Card) => void;
}

export default function ListComponent({ list, onCardClick }: ListComponentProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: list.id,
    data: { type: 'list' },
  });

  const { lists, addCard, deleteList: deleteListStore, updateList: updateListStore } =
    useBoardStore();

  /** ✅ SOURCE OF TRUTH FOR CARDS */
  const cards = lists.find((l) => l.id === list.id)?.cards ?? [];

  const [isAddingCard, setIsAddingCard] = useState(false);
  const [cardTitle, setCardTitle] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [listTitle, setListTitle] = useState(list.title);

  const style = { transform: CSS.Transform.toString(transform), transition };

  /** ✅ ADD CARD */
  const handleAddCard = async () => {
    if (!cardTitle.trim()) return;

    try {
      const response = await createCard({
        title: cardTitle.trim(),
        listId: list.id,
        position: cards.length,
      });

      addCard(response.data);
      setCardTitle('');
      setIsAddingCard(false);
    } catch (error) {
      console.error('Error creating card:', error);
    }
  };

  /** ✅ UPDATE LIST TITLE */
  const handleUpdateTitle = async () => {
    if (listTitle.trim() && listTitle !== list.title) {
      try {
        await updateList(list.id, { title: listTitle.trim() });
        updateListStore(list.id, { title: listTitle.trim() });
      } catch {
        setListTitle(list.title);
      }
    }
    setIsEditingTitle(false);
  };

  /** ✅ DELETE LIST */
  const handleDeleteList = async () => {
    if (!confirm('Delete this list?')) return;

    try {
      await deleteList(list.id);
      deleteListStore(list.id);
    } catch (error) {
      console.error('Error deleting list:', error);
    }
    setShowMenu(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-gray-100 rounded-lg p-3 w-[272px] flex-shrink-0 flex flex-col"
    >
      {/* HEADER */}
      <div className="flex items-center justify-between mb-2">
        {isEditingTitle ? (
          <input
            value={listTitle}
            onChange={(e) => setListTitle(e.target.value)}
            onBlur={handleUpdateTitle}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleUpdateTitle();
              if (e.key === 'Escape') {
                setListTitle(list.title);
                setIsEditingTitle(false);
              }
            }}
            className="flex-1 px-2 py-1 font-semibold bg-white rounded border"
            autoFocus
          />
        ) : (
          <h3
            {...attributes}
            {...listeners}
            onClick={() => setIsEditingTitle(true)}
            className="flex-1 font-semibold text-gray-800 cursor-grab px-2 py-1"
          >
            {listTitle}
          </h3>
        )}

        <div className="relative">
          <button onClick={() => setShowMenu(!showMenu)}>
            <FiMoreVertical />
          </button>

          {showMenu && (
            <button
              onClick={handleDeleteList}
              className="absolute right-0 mt-1 bg-white shadow px-3 py-2 text-red-600 rounded"
            >
              Delete List
            </button>
          )}
        </div>
      </div>

      {/* CARDS */}
      <div className="space-y-2 mb-2">
        {cards.map((card) => (
          <CardComponent key={card.id} card={card} onClick={() => onCardClick(card)} />
        ))}
      </div>

      {/* ADD CARD */}
      {isAddingCard ? (
        <div className="bg-white rounded p-2">
          <textarea
            value={cardTitle}
            onChange={(e) => setCardTitle(e.target.value)}
            className="w-full p-2 border rounded"
            rows={3}
            autoFocus
          />
          <div className="flex gap-2 mt-2">
            <button onClick={handleAddCard} className="bg-blue-600 text-white px-3 py-1 rounded">
              Add Card
            </button>
            <button
              onClick={() => {
                setIsAddingCard(false);
                setCardTitle('');
              }}
            >
              ✕
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsAddingCard(true)}
          className="flex items-center gap-2 text-sm text-gray-600"
        >
          <FiPlus />
          Add a card
        </button>
      )}
    </div>
  );
}
