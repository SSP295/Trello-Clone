import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Boards
export const getBoards = () => api.get('/boards');
export const getBoard = (id: string) => api.get(`/boards/${id}`);
export const createBoard = (data: { title: string; description?: string; background?: string }) =>
  api.post('/boards', data);
export const updateBoard = (id: string, data: { title?: string; description?: string; background?: string }) =>
  api.put(`/boards/${id}`, data);
export const deleteBoard = (id: string) => api.delete(`/boards/${id}`);

// Lists
export const getLists = (boardId: string) => api.get(`/lists/board/${boardId}`);
export const getList = (id: string) => api.get(`/lists/${id}`);
export const createList = (data: { title: string; boardId: string; position?: number }) =>
  api.post('/lists', data);
export const updateList = (id: string, data: { title?: string; position?: number }) =>
  api.put(`/lists/${id}`, data);
export const reorderLists = (lists: { id: string; position: number }[]) =>
  api.put('/lists/reorder', { lists });
export const deleteList = (id: string) => api.delete(`/lists/${id}`);

// Cards
export const getCards = (listId: string) => api.get(`/cards/list/${listId}`);
export const getCard = (id: string) => api.get(`/cards/${id}`);
export const createCard = (data: { title: string; description?: string; listId: string; position?: number; dueDate?: string }) =>
  api.post('/cards', data);
export const updateCard = (id: string, data: any) => api.put(`/cards/${id}`, data);
export const moveCard = (id: string, data: { listId: string; position: number }) =>
  api.put(`/cards/${id}/move`, data);
export const reorderCards = (cards: { id: string; listId: string; position: number }[]) =>
  api.put('/cards/reorder', { cards });
export const deleteCard = (id: string) => api.delete(`/cards/${id}`);

// Labels
export const getLabels = (boardId: string) => api.get(`/labels/board/${boardId}`);
export const createLabel = (data: { name: string; color: string; boardId: string }) =>
  api.post('/labels', data);
export const updateLabel = (id: string, data: { name?: string; color?: string }) =>
  api.put(`/labels/${id}`, data);
export const deleteLabel = (id: string) => api.delete(`/labels/${id}`);

// Card Labels
export const addLabelToCard = (cardId: string, labelId: string) =>
  api.post(`/cards/${cardId}/labels`, { labelId });
export const removeLabelFromCard = (cardId: string, labelId: string) =>
  api.delete(`/cards/${cardId}/labels/${labelId}`);

// Card Members
export const addMemberToCard = (cardId: string, userId: string) =>
  api.post(`/cards/${cardId}/members`, { userId });
export const removeMemberFromCard = (cardId: string, userId: string) =>
  api.delete(`/cards/${cardId}/members/${userId}`);

// Checklists
export const createChecklist = (cardId: string, data: { title: string; position?: number }) =>
  api.post(`/cards/${cardId}/checklists`, data);
export const updateChecklist = (id: string, data: { title?: string }) =>
  api.put(`/cards/checklists/${id}`, data);
export const deleteChecklist = (id: string) => api.delete(`/cards/checklists/${id}`);

// Checklist Items
export const createChecklistItem = (checklistId: string, data: { text: string; position?: number }) =>
  api.post(`/cards/checklists/${checklistId}/items`, data);
export const updateChecklistItem = (id: string, data: { text?: string; isCompleted?: boolean; position?: number }) =>
  api.put(`/cards/checklist-items/${id}`, data);
export const deleteChecklistItem = (id: string) => api.delete(`/cards/checklist-items/${id}`);

// Attachments
export const uploadAttachment = (cardId: string, file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post(`/cards/${cardId}/attachments`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};
export const deleteAttachment = (id: string) => api.delete(`/cards/attachments/${id}`);

// Comments
export const createComment = (cardId: string, data: { text: string; userId: string }) =>
  api.post(`/cards/${cardId}/comments`, data);
export const updateComment = (id: string, data: { text: string }) =>
  api.put(`/cards/comments/${id}`, data);
export const deleteComment = (id: string) => api.delete(`/cards/comments/${id}`);

// Users
export const getUsers = () => api.get('/users');
export const getUser = (id: string) => api.get(`/users/${id}`);

// Search
export const searchCards = (params: {
  q?: string;
  labelId?: string;
  userId?: string;
  dueDate?: string;
  boardId?: string;
}) => api.get('/search/cards', { params });

export default api;
