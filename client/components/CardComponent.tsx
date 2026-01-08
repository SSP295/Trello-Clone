'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FiClock, FiUser, FiCheckSquare } from 'react-icons/fi';
import { format } from 'date-fns';
import { Card } from '@/types';

interface CardComponentProps {
  card: Card;
  onClick: () => void;
}

export default function CardComponent({ card, onClick }: CardComponentProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({
      id: card.id,
      data: {
        type: 'card',
        card,
        listId: card.listId,
      },
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const isOverdue = card.dueDate && new Date(card.dueDate) < new Date();
  const labels = card.labels ?? [];
  const members = card.members ?? [];
  const checklists = card.checklists ?? [];

  // ✅ SAFE CHECKLIST COUNTS
  const completedChecklistItems = checklists.reduce(
    (acc, checklist) =>
      acc + (checklist.items?.filter(item => item.isCompleted).length ?? 0),
    0
  );

  const totalChecklistItems = checklists.reduce(
    (acc, checklist) =>
      acc + (checklist.items?.length ?? 0),
    0
  );

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className="bg-white rounded p-2 shadow-sm hover:shadow-lg cursor-pointer transition-all duration-200 hover-lift group animate-fadeIn"
    >
      {/* COVER IMAGE */}
      {card.coverImage && (
        <div
          className="w-full h-32 rounded mb-2 bg-cover bg-center"
          style={{ backgroundImage: `url(${card.coverImage})` }}
        />
      )}

      {/* LABELS */}
      {labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {labels.map((cardLabel) => (
            <div
              key={cardLabel.id}
              className="h-2 rounded flex-1 min-w-[40px] transition-all duration-200 hover:opacity-80 hover:scale-105"
              style={{ backgroundColor: cardLabel.label.color }}
              title={cardLabel.label.name}
            />
          ))}
        </div>
      )}

      {/* TITLE */}
      <div className="text-sm font-medium text-gray-800 mb-2 group-hover:text-blue-600 transition-colors duration-200">
        {card.title}
      </div>

      {/* META INFO */}
      <div className="flex items-center gap-2 text-xs text-gray-500">
        {/* DUE DATE */}
        {card.dueDate && (
          <div className={`flex items-center gap-1 ${isOverdue ? 'text-red-600' : ''}`}>
            <FiClock size={12} />
            <span>{format(new Date(card.dueDate), 'MMM d')}</span>
          </div>
        )}

        {/* MEMBERS */}
        {members.length > 0 && (
          <div className="flex items-center gap-1">
            <FiUser size={12} />
            <span>{members.length}</span>
          </div>
        )}

        {/* CHECKLIST */}
        {totalChecklistItems > 0 && (
          <div className="flex items-center gap-1">
            <FiCheckSquare size={12} />
            <span>
              {completedChecklistItems}/{totalChecklistItems}
            </span>
          </div>
        )}

        {/* ATTACHMENTS */}
        {card.attachments && card.attachments.length > 0 && (
          <div className="flex items-center gap-1">
            <span>📎 {card.attachments.length}</span>
          </div>
        )}
      </div>
    </div>
  );
}
