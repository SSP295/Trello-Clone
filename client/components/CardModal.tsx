'use client';

import { useState, useEffect } from 'react';
import { FiX, FiClock, FiUser, FiTag, FiCheckSquare, FiPaperclip, FiMessageSquare, FiTrash2 } from 'react-icons/fi';
import { format } from 'date-fns';
import { useBoardStore } from '@/store/boardStore';
import {
  updateCard,
  deleteCard,
  addLabelToCard,
  removeLabelFromCard,
  addMemberToCard,
  removeMemberFromCard,
  createChecklist,
  deleteChecklist,
  createChecklistItem,
  updateChecklistItem,
  deleteChecklistItem,
  uploadAttachment,
  deleteAttachment,
  createComment,
  deleteComment,
} from '@/lib/api';
import { Card, Label, User, Checklist, ChecklistItem, Attachment, Comment } from '@/types';

interface CardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CardModal({ isOpen, onClose }: CardModalProps) {
  const { selectedCard, board, labels, users, updateCard: updateCardStore, deleteCard: deleteCardStore } = useBoardStore();
  const [card, setCard] = useState<Card | null>(selectedCard);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [showLabelMenu, setShowLabelMenu] = useState(false);
  const [showMemberMenu, setShowMemberMenu] = useState(false);
  const [newChecklistTitle, setNewChecklistTitle] = useState('');
  const [showAddChecklist, setShowAddChecklist] = useState(false);
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    if (selectedCard) {
      setCard(selectedCard);
      setTitle(selectedCard.title);
      setDescription(selectedCard.description || '');
      setDueDate(selectedCard.dueDate ? format(new Date(selectedCard.dueDate), "yyyy-MM-dd'T'HH:mm") : '');
    }
  }, [selectedCard]);

  if (!isOpen || !card || !board) return null;

  // --- Update Handlers ---
  const handleUpdateTitle = async () => {
    if (title.trim() && title !== card.title) {
      try {
        const response = await updateCard(card.id, { title: title.trim() });
        setCard(response.data);
        updateCardStore(card.id, { title: title.trim() });
      } catch (error) {
        console.error('Error updating title:', error);
        setTitle(card.title);
      }
    } else {
      setTitle(card.title);
    }
    setIsEditingTitle(false);
  };

  const handleUpdateDescription = async () => {
    try {
      const response = await updateCard(card.id, { description: description.trim() });
      setCard(response.data);
      updateCardStore(card.id, { description: description.trim() });
    } catch (error) {
      console.error('Error updating description:', error);
    }
    setIsEditingDescription(false);
  };

  const handleUpdateDueDate = async () => {
    try {
      const response = await updateCard(card.id, { dueDate: dueDate || null });
      setCard(response.data);
      updateCardStore(card.id, { dueDate: dueDate || null });
    } catch (error) {
      console.error('Error updating due date:', error);
    }
  };

  // --- Label Handlers ---
  const handleToggleLabel = async (labelId: string) => {
    const isAttached = card.labels?.some((cl) => cl.labelId === labelId);
    try {
      if (isAttached) {
        await removeLabelFromCard(card.id, labelId);
        setCard({
          ...card,
          labels: card.labels?.filter((cl) => cl.labelId !== labelId) || [],
        });
      } else {
        await addLabelToCard(card.id, labelId);
        const label = labels.find((l) => l.id === labelId);
        if (label) {
          setCard({
            ...card,
            labels: [...(card.labels || []), { id: '', cardId: card.id, labelId, label }],
          });
        }
      }
      updateCardStore(card.id, {});
    } catch (error) {
      console.error('Error toggling label:', error);
    }
  };

  // --- Member Handlers ---
  const handleToggleMember = async (userId: string) => {
    const isMember = card.members?.some((cm) => cm.userId === userId);
    try {
      if (isMember) {
        await removeMemberFromCard(card.id, userId);
        setCard({
          ...card,
          members: card.members?.filter((cm) => cm.userId !== userId) || [],
        });
      } else {
        await addMemberToCard(card.id, userId);
        const user = users.find((u) => u.id === userId);
        if (user) {
          setCard({
            ...card,
            members: [...(card.members || []), { id: '', cardId: card.id, userId, user }],
          });
        }
      }
      updateCardStore(card.id, {});
    } catch (error) {
      console.error('Error toggling member:', error);
    }
  };

  // --- Checklist Handlers ---
  const handleCreateChecklist = async () => {
    if (!newChecklistTitle.trim()) return;
    try {
      const response = await createChecklist(card.id, { title: newChecklistTitle.trim() });
      setCard({
        ...card,
        checklists: [...(card.checklists || []), response.data],
      });
      setNewChecklistTitle('');
      setShowAddChecklist(false);
      updateCardStore(card.id, {});
    } catch (error) {
      console.error('Error creating checklist:', error);
    }
  };

  const handleDeleteChecklist = async (checklistId: string) => {
    try {
      await deleteChecklist(checklistId);
      setCard({
        ...card,
        checklists: card.checklists?.filter((c: Checklist) => c.id !== checklistId) || [],
      });
      updateCardStore(card.id, {});
    } catch (error) {
      console.error('Error deleting checklist:', error);
    }
  };

  const handleAddChecklistItem = async (checklistId: string, text: string) => {
    if (!text.trim()) return;
    try {
      const response = await createChecklistItem(checklistId, { text: text.trim() });
      setCard({
        ...card!,
        checklists: card!.checklists?.map((c: Checklist) =>
          c.id === checklistId
            ? { ...c, items: [...(c.items || []), response.data] }
            : c
        ) || [],
      });
      updateCardStore(card!.id, {});
    } catch (error) {
      console.error('Error adding checklist item:', error);
    }
  };

  const handleToggleChecklistItem = async (itemId: string, isCompleted: boolean) => {
    try {
      await updateChecklistItem(itemId, { isCompleted: !isCompleted });
      setCard({
        ...card!,
        checklists: card!.checklists?.map((c: Checklist) => ({
          ...c,
          items: c.items?.map((item: ChecklistItem) =>
            item.id === itemId ? { ...item, isCompleted: !isCompleted } : item
          ) || [],
        })) || [],
      });
      updateCardStore(card!.id, {});
    } catch (error) {
      console.error('Error toggling checklist item:', error);
    }
  };

  const handleDeleteChecklistItem = async (itemId: string) => {
    try {
      await deleteChecklistItem(itemId);
      setCard({
        ...card!,
        checklists: card!.checklists?.map((c: Checklist) => ({
          ...c,
          items: c.items?.filter((item: ChecklistItem) => item.id !== itemId) || [],
        })) || [],
      });
      updateCardStore(card!.id, {});
    } catch (error) {
      console.error('Error deleting checklist item:', error);
    }
  };

  // --- Attachment Handlers ---
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const response = await uploadAttachment(card.id, file);
      setCard({
        ...card,
        attachments: [...(card.attachments || []), response.data],
      });
      updateCardStore(card.id, {});
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  const handleDeleteAttachment = async (attachmentId: string) => {
    try {
      await deleteAttachment(attachmentId);
      setCard({
        ...card,
        attachments: card.attachments?.filter((a: Attachment) => a.id !== attachmentId) || [],
      });
      updateCardStore(card.id, {});
    } catch (error) {
      console.error('Error deleting attachment:', error);
    }
  };

  // --- Comment Handlers ---
  const handleAddComment = async () => {
    if (!commentText.trim() || !users[0]) return;
    try {
      const response = await createComment(card.id, {
        text: commentText.trim(),
        userId: users[0].id,
      });
      setCard({
        ...card,
        comments: [response.data, ...(card.comments || [])],
      });
      setCommentText('');
      updateCardStore(card.id, {});
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await deleteComment(commentId);
      setCard({
        ...card,
        comments: card.comments?.filter((c: Comment) => c.id !== commentId) || [],
      });
      updateCardStore(card.id, {});
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  // --- Card Delete ---
  const handleDeleteCard = async () => {
    if (confirm('Are you sure you want to delete this card?')) {
      try {
        await deleteCard(card.id);
        deleteCardStore(card.id);
        onClose();
      } catch (error) {
        console.error('Error deleting card:', error);
      }
    }
  };

  const cardLabels = card.labels || [];
  const cardMembers = card.members || [];
  const cardChecklists = card.checklists || [];
  const cardAttachments = card.attachments || [];
  const cardComments = card.comments || [];
  const isOverdue = card.dueDate && new Date(card.dueDate) < new Date();

  // --- JSX rendering remains mostly unchanged, including AddChecklistItemInput component ---

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2 md:p-4 animate-fadeIn backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[95vh] md:max-h-[90vh] overflow-y-auto animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ...rest of your JSX unchanged ... */}
      </div>
    </div>
  );
}

function AddChecklistItemInput({
  checklistId,
  onAdd,
}: {
  checklistId: string;
  onAdd: (checklistId: string, text: string) => void;
}) {
  const [text, setText] = useState('');

  const handleSubmit = () => {
    if (text.trim()) {
      onAdd(checklistId, text);
      setText('');
    }
  };

  return (
    <div className="flex items-center gap-2 animate-fadeIn">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            handleSubmit();
          }
        }}
        placeholder="Add an item..."
        className="flex-1 p-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
      />
      <button
        onClick={handleSubmit}
        className="px-2 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm hover:shadow-md"
      >
        Add
      </button>
    </div>
  );
}
