'use client';

import { useState } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { FiPlus } from 'react-icons/fi';
import BoardHeader from './BoardHeader';
import ListComponent from './ListComponent';
import CardModal from './CardModal';
import { useBoardStore } from '@/store/boardStore';
import { reorderLists, moveCard, createList } from '@/lib/api';
import { Card } from '@/types';

export default function BoardView() {
  const { board, lists, setLists, addList, setSelectedCard, selectedCard, isLoading } = useBoardStore();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddingList, setIsAddingList] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  if (isLoading || !board) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: board?.background || '#0079bf' }}>
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <div className="text-xl text-white animate-pulse-slow">Loading board...</div>
        </div>
      </div>
    );
  }

  // Drag handlers
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Reorder lists
    if (active.data.current?.type === 'list') {
      const oldIndex = lists.findIndex((l) => l.id === activeId);
      const newIndex = lists.findIndex((l) => l.id === overId);
      if (oldIndex !== newIndex) {
        const newLists = [...lists];
        const [moved] = newLists.splice(oldIndex, 1);
        newLists.splice(newIndex, 0, moved);

        const updatedLists = newLists.map((list, index) => ({ ...list, position: index }));
        setLists(updatedLists);
        try {
          await reorderLists(updatedLists.map((l) => ({ id: l.id, position: l.position })));
        } catch (err) {
          console.error(err);
          setLists(lists);
        }
      }
      return;
    }

    // Move cards
    if (active.data.current?.type === 'card') {
      const card = active.data.current.card as Card;
      const sourceListId = card.listId;
      const targetListId = over.data.current?.listId || overId;

      // Dropped on a list
      if (over.data.current?.type === 'list') {
        const targetList = lists.find((l) => l.id === targetListId);
        if (!targetList) return;

        const newPosition = targetList.cards?.length || 0;

        try {
          await moveCard(card.id, { listId: targetListId, position: newPosition });

          const updatedLists = lists.map((list) => {
            if (list.id === sourceListId) {
              return { ...list, cards: list.cards?.filter((c) => c.id !== card.id) || [] };
            }
            if (list.id === targetListId) {
              return { ...list, cards: [...(list.cards || []), { ...card, listId: targetListId, position: newPosition }] };
            }
            return list;
          });
          setLists(updatedLists);
        } catch (err) {
          console.error(err);
        }
        return;
      }

      // Dropped on another card
      const targetCard = over.data.current?.card as Card;
      if (!targetCard) return;

      const targetList = lists.find((l) => l.id === targetCard.listId);
      const sourceList = lists.find((l) => l.id === sourceListId);
      if (!targetList || !sourceList) return;

      const sourceCards = sourceList.cards || [];
      const targetCards = targetList.cards || [];

      const newSourceCards = sourceCards.filter((c) => c.id !== card.id);
      const targetIndex = targetCards.findIndex((c) => c.id === targetCard.id);
      const newTargetCards = [...targetCards];
      newTargetCards.splice(targetIndex, 0, { ...card, listId: targetCard.listId });

      const updatedCards = newTargetCards.map((c, index) => ({ ...c, position: index }));

      try {
        await moveCard(card.id, { listId: targetCard.listId, position: targetIndex });

        const updatedLists = lists.map((list) => {
          if (list.id === sourceListId) return { ...list, cards: newSourceCards };
          if (list.id === targetCard.listId) return { ...list, cards: updatedCards };
          return list;
        });
        setLists(updatedLists);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleCardClick = (card: Card) => {
    setSelectedCard(card);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCard(null);
  };

  const handleAddList = async () => {
    if (!newListTitle.trim()) return;
    try {
      const response = await createList({
        title: newListTitle.trim(),
        boardId: board.id,
        position: lists.length,
      });
      addList(response.data);
      setNewListTitle('');
      setIsAddingList(false);
    } catch (err) {
      console.error(err);
    }
  };

  const activeCard = activeId
    ? lists.flatMap((l) => l.cards || []).find((c) => c.id === activeId)
    : null;

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: board.background || '#0079bf',
        backgroundImage: board.background?.startsWith('http') ? `url(${board.background})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <BoardHeader />
      <div className="p-2 md:p-4 overflow-x-auto h-[calc(100vh-60px)]">
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="flex gap-2 md:gap-4 h-full min-w-max transition-all duration-300">
            <SortableContext items={lists.map((l) => l.id)} strategy={horizontalListSortingStrategy}>
              {lists.map((list) => (
                <ListComponent key={list.id} list={list} onCardClick={handleCardClick} />
              ))}
            </SortableContext>

            {isAddingList ? (
              <div className="bg-gray-100 rounded-lg p-2 md:p-3 w-[260px] md:w-[272px] flex-shrink-0 h-fit">
                <input
                  value={newListTitle}
                  onChange={(e) => setNewListTitle(e.target.value)}
                  placeholder="Enter list title..."
                  className="w-full px-2 py-1.5 mb-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddList();
                    if (e.key === 'Escape') {
                      setIsAddingList(false);
                      setNewListTitle('');
                    }
                  }}
                />
                <div className="flex gap-2">
                  <button onClick={handleAddList} className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium">Add List</button>
                  <button onClick={() => { setIsAddingList(false); setNewListTitle(''); }} className="p-1 hover:bg-gray-200 rounded transition-colors">✕</button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsAddingList(true)}
                className="bg-gray-200 hover:bg-gray-300 rounded-lg p-3 w-[260px] md:w-[272px] flex-shrink-0 h-fit flex items-center gap-2 text-gray-700 font-medium transition-colors"
              >
                <FiPlus size={20} /> Add another list
              </button>
            )}
          </div>

          <DragOverlay>
            {activeCard && (
              <div className="bg-white p-2 rounded shadow-lg max-w-[272px]">
                <div className="text-sm font-medium">{activeCard.title}</div>
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </div>

      {isModalOpen && selectedCard && (
        <CardModal isOpen={isModalOpen} onClose={handleCloseModal} />
      )}
    </div>
  );
}
