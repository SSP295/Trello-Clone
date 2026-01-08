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
import { Card, Label, User } from '@/types';

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

  const handleToggleLabel = async (labelId: string) => {
    const isAttached = card.labels?.some((cl: { labelId: string }) => cl.labelId === labelId);
    try {
      if (isAttached) {
        await removeLabelFromCard(card.id, labelId);
        setCard({
          ...card,
          labels: card.labels?.filter((cl: { labelId: string }) => cl.labelId !== labelId) || [],
        });
      } else {
        await addLabelToCard(card.id, labelId);
        const label = labels.find((l: { id: string }) => l.id === labelId);
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

  const handleToggleMember = async (userId: string) => {
    const isMember = card.members?.some((cm: { userId: string }) => cm.userId === userId);
    try {
      if (isMember) {
        await removeMemberFromCard(card.id, userId);
        setCard({
          ...card,
          members: card.members?.filter((cm: { userId: string }) => cm.userId !== userId) || [],
        });
      } else {
        await addMemberToCard(card.id, userId);
        const user = users.find((u: { id: string }) => u.id === userId);
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
        checklists: card.checklists?.filter((c: { id: string }) => c.id !== checklistId) || [],
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
        ...card,
        checklists: card.checklists?.map((c: { id: string; items?: any[] }) =>
          c.id === checklistId
            ? { ...c, items: [...(c.items || []), response.data] }
            : c
        ) || [],
      });
      updateCardStore(card.id, {});
    } catch (error) {
      console.error('Error adding checklist item:', error);
    }
  };

  const handleToggleChecklistItem = async (itemId: string, isCompleted: boolean) => {
    try {
      await updateChecklistItem(itemId, { isCompleted: !isCompleted });
      setCard({
        ...card,
        checklists: card.checklists?.map((c) => ({
          ...c,
          items: c.items?.map((item: { id: string; isCompleted: boolean }) =>
            item.id === itemId ? { ...item, isCompleted: !isCompleted } : item
          ) || [],
        })) || [],
      });
      updateCardStore(card.id, {});
    } catch (error) {
      console.error('Error toggling checklist item:', error);
    }
  };

  const handleDeleteChecklistItem = async (itemId: string) => {
    try {
      await deleteChecklistItem(itemId);
      setCard({
        ...card,
        checklists: card.checklists?.map((c) => ({
          ...c,
          items: c.items?.filter((item: { id: string }) => item.id !== itemId) || [],
        })) || [],
      });
      updateCardStore(card.id, {});
    } catch (error) {
      console.error('Error deleting checklist item:', error);
    }
  };

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
        attachments: card.attachments?.filter((a: { id: string }) => a.id !== attachmentId) || [],
      });
      updateCardStore(card.id, {});
    } catch (error) {
      console.error('Error deleting attachment:', error);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim() || !users[0]) return;
    try {
      const response = await createComment(card.id, {
        text: commentText.trim(),
        userId: users[0].id, // Default user
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
        comments: card.comments?.filter((c) => c.id !== commentId) || [],
      });
      updateCardStore(card.id, {});
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

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

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2 md:p-4 animate-fadeIn backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[95vh] md:max-h-[90vh] overflow-y-auto animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        {card.coverImage && (
          <div
            className="w-full h-48 bg-cover bg-center"
            style={{ backgroundImage: `url(${card.coverImage})` }}
          />
        )}

        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
                {isEditingTitle ? (
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={handleUpdateTitle}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleUpdateTitle();
                    if (e.key === 'Escape') {
                      setTitle(card.title);
                      setIsEditingTitle(false);
                    }
                  }}
                  className="text-2xl font-semibold text-gray-800 w-full px-2 py-1 border-2 border-blue-500 rounded focus:outline-none animate-scaleIn transition-all duration-200"
                  autoFocus
                />
              ) : (
                <h2
                  className="text-2xl font-semibold text-gray-800 cursor-pointer hover:bg-gray-100 rounded px-2 py-1 -mx-2 transition-all duration-200 hover:scale-105"
                  onClick={() => setIsEditingTitle(true)}
                >
                  {card.title}
                </h2>
              )}
              <p className="text-sm text-gray-500 mt-1">
                in list <span className="font-medium">{card.list?.title || 'Unknown'}</span>
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 rounded transition-colors"
            >
              <FiX size={24} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <div className="md:col-span-2 space-y-3 md:space-y-4">
              {cardLabels.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {cardLabels.map((cardLabel) => (
                    <div
                      key={cardLabel.id}
                      className="px-3 py-1 rounded text-white text-sm font-medium"
                      style={{ backgroundColor: cardLabel.label.color }}
                    >
                      {cardLabel.label.name}
                    </div>
                  ))}
                </div>
              )}

              <div>
                <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <FiTag size={18} />
                  Description
                </h3>
                {isEditingDescription ? (
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    onBlur={handleUpdateDescription}
                    className="w-full p-2 border border-gray-300 rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 animate-scaleIn"
                    rows={4}
                    placeholder="Add a more detailed description..."
                    autoFocus
                  />
                ) : (
                  <div
                    onClick={() => setIsEditingDescription(true)}
                    className="min-h-[80px] p-2 bg-gray-50 rounded hover:bg-gray-100 cursor-pointer transition-all duration-200 hover:scale-[1.01]"
                  >
                    {description || (
                      <span className="text-gray-400">Add a more detailed description...</span>
                    )}
                  </div>
                )}
              </div>

              {cardChecklists.map((checklist) => (
                <div key={checklist.id} className="border-t pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                      <FiCheckSquare size={18} />
                      {checklist.title}
                    </h3>
                    <button
                      onClick={() => handleDeleteChecklist(checklist.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                  <div className="space-y-2">
                    {checklist.items?.map((item) => (
                      <div key={item.id} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={item.isCompleted}
                          onChange={() => handleToggleChecklistItem(item.id, item.isCompleted)}
                          className="w-4 h-4"
                        />
                        <span
                          className={`flex-1 ${item.isCompleted ? 'line-through text-gray-500' : ''}`}
                        >
                          {item.text}
                        </span>
                        <button
                          onClick={() => handleDeleteChecklistItem(item.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <FiX size={16} />
                        </button>
                      </div>
                    ))}
                    <AddChecklistItemInput
                      checklistId={checklist.id}
                      onAdd={handleAddChecklistItem}
                    />
                  </div>
                </div>
              ))}

              {showAddChecklist ? (
                <div className="border-t pt-4">
                  <input
                    value={newChecklistTitle}
                    onChange={(e) => setNewChecklistTitle(e.target.value)}
                    placeholder="Checklist title"
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleCreateChecklist();
                      if (e.key === 'Escape') {
                        setShowAddChecklist(false);
                        setNewChecklistTitle('');
                      }
                    }}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleCreateChecklist}
                      className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => {
                        setShowAddChecklist(false);
                        setNewChecklistTitle('');
                      }}
                      className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowAddChecklist(true)}
                  className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2"
                >
                  <FiCheckSquare size={18} />
                  Add Checklist
                </button>
              )}

              {cardAttachments.length > 0 && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <FiPaperclip size={18} />
                    Attachments
                  </h3>
                  <div className="space-y-2">
                    {cardAttachments.map((attachment) => (
                      <div key={attachment.id} className="flex items-center justify-between p-2 bg-gray-50 rounded group/attach hover:bg-gray-100 transition-all duration-200 animate-fadeIn">
                        <a
                          href={attachment.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline flex-1 group-hover/attach:text-blue-800 transition-colors duration-200"
                        >
                          {attachment.name}
                        </a>
                        <button
                          onClick={() => handleDeleteAttachment(attachment.id)}
                          className="text-red-600 hover:text-red-800 opacity-0 group-hover/attach:opacity-100 transition-all duration-200 hover:scale-125"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t pt-4">
                <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <FiPaperclip size={18} />
                  Attach
                </h3>
                <label className="block">
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    className="text-sm cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all duration-200"
                  />
                </label>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <FiMessageSquare size={18} />
                  Activity
                </h3>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Write a comment..."
                      className="flex-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleAddComment();
                        }
                      }}
                    />
                    <button
                      onClick={handleAddComment}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Save
                    </button>
                  </div>
                    {cardComments.map((comment: { id: string; text: string; user: { name: string; avatar?: string }; createdAt: string }) => (
                    <div key={comment.id} className="bg-gray-50 rounded p-3 group/comment animate-fadeIn hover:bg-gray-100 transition-all duration-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {comment.user.avatar && (
                              <img
                                src={comment.user.avatar}
                                alt={comment.user.name}
                                className="w-6 h-6 rounded-full transition-all duration-200 group-hover/comment:scale-110"
                              />
                            )}
                            <span className="font-semibold text-sm group-hover/comment:text-blue-600 transition-colors duration-200">{comment.user.name}</span>
                            <span className="text-xs text-gray-500">
                              {format(new Date(comment.createdAt), 'MMM d, yyyy h:mm a')}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">{comment.text}</p>
                        </div>
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="text-red-600 hover:text-red-800 opacity-0 group-hover/comment:opacity-100 transition-all duration-200 hover:scale-125"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-xs font-semibold text-gray-600 uppercase mb-2">Add to card</h3>
                <div className="space-y-2">
                  <div className="relative">
                    <button
                      onClick={() => setShowMemberMenu(!showMemberMenu)}
                      className="w-full text-left px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded flex items-center gap-2 text-sm"
                    >
                      <FiUser size={16} />
                      Members
                    </button>
                    {showMemberMenu && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setShowMemberMenu(false)}
                        />
                        <div className="absolute top-full left-0 mt-1 bg-white rounded shadow-lg z-20 min-w-[200px] p-2">
                          {users.map((user) => {
                            const isMember = cardMembers.some((cm) => cm.userId === user.id);
                            return (
                              <button
                                key={user.id}
                                onClick={() => handleToggleMember(user.id)}
                                className="w-full text-left px-2 py-2 hover:bg-gray-100 rounded flex items-center gap-2"
                              >
                                <input
                                  type="checkbox"
                                  checked={isMember}
                                  onChange={() => {}}
                                  className="w-4 h-4"
                                />
                                {user.avatar && (
                                  <img
                                    src={user.avatar}
                                    alt={user.name}
                                    className="w-6 h-6 rounded-full"
                                  />
                                )}
                                <span className="text-sm">{user.name}</span>
                              </button>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>

                  <div className="relative">
                    <button
                      onClick={() => setShowLabelMenu(!showLabelMenu)}
                      className="w-full text-left px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded flex items-center gap-2 text-sm"
                    >
                      <FiTag size={16} />
                      Labels
                    </button>
                    {showLabelMenu && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setShowLabelMenu(false)}
                        />
                        <div className="absolute top-full left-0 mt-1 bg-white rounded shadow-lg z-20 min-w-[200px] p-2">
                          {labels.map((label) => {
                            const isAttached = cardLabels.some((cl) => cl.labelId === label.id);
                            return (
                              <button
                                key={label.id}
                                onClick={() => handleToggleLabel(label.id)}
                                className="w-full text-left px-2 py-2 hover:bg-gray-100 rounded flex items-center gap-2"
                              >
                                <input
                                  type="checkbox"
                                  checked={isAttached}
                                  onChange={() => {}}
                                  className="w-4 h-4"
                                />
                                <div
                                  className="w-6 h-6 rounded"
                                  style={{ backgroundColor: label.color }}
                                />
                                <span className="text-sm">{label.name}</span>
                              </button>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>

                  <div className="relative">
                    <label className="w-full text-left px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded flex items-center gap-2 text-sm cursor-pointer">
                      <FiClock size={16} />
                      Due Date
                    </label>
                    <input
                      type="datetime-local"
                      value={dueDate}
                      onChange={(e) => {
                        setDueDate(e.target.value);
                        handleUpdateDueDate();
                      }}
                      className="absolute opacity-0 w-0 h-0"
                    />
                    {card.dueDate && (
                      <div className={`mt-2 px-3 py-2 rounded text-sm ${isOverdue ? 'bg-red-100 text-red-800' : 'bg-gray-100'}`}>
                        {format(new Date(card.dueDate), 'MMM d, yyyy h:mm a')}
                        {isOverdue && <span className="ml-2 font-semibold">(Overdue)</span>}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-semibold text-gray-600 uppercase mb-2">Actions</h3>
                <button
                  onClick={handleDeleteCard}
                  className="w-full text-left px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded text-sm"
                >
                  Delete Card
                </button>
              </div>
            </div>
          </div>
        </div>
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
