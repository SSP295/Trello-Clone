import { create } from 'zustand';
import { Board, List, Card, Label, User } from '@/types';

interface BoardStore {
  board: Board | null;
  lists: List[];
  isLoading: boolean;
  selectedCard: Card | null;
  labels: Label[];
  users: User[];

  setBoard: (board: Board) => void;
  setLists: (lists: List[]) => void;
  addList: (list: List) => void;
  addCard: (card: Card) => void; // ✅ Add card
  updateCard: (cardId: string, data: Partial<Card>) => void;
  deleteCard: (cardId: string) => void;
  updateList: (listId: string, data: Partial<List>) => void; // ✅ Update list
  deleteList: (listId: string) => void; // ✅ Delete list
  setSelectedCard: (card: Card | null) => void;
  setLabels: (labels: Label[]) => void;
  setUsers: (users: User[]) => void;
  setLoading: (isLoading: boolean) => void;
}

export const useBoardStore = create<BoardStore>((set, get) => ({
  board: null,
  lists: [],
  isLoading: true,
  selectedCard: null,
  labels: [],
  users: [],

  setBoard: (board) => set({ board }),
  setLists: (lists) => set({ lists }),
  addList: (list) => set({ lists: [...get().lists, list] }),

  addCard: (card) =>
    set({
      lists: get().lists.map((list) =>
        list.id === card.listId
          ? { ...list, cards: [...(list.cards || []), card] }
          : list
      ),
    }),

  updateCard: (cardId, data) =>
    set({
      lists: get().lists.map((list) => ({
        ...list,
        cards: list.cards?.map((c) => (c.id === cardId ? { ...c, ...data } : c)) || [],
      })),
      selectedCard: get().selectedCard?.id === cardId ? { ...get().selectedCard!, ...data } : get().selectedCard,
    }),

  deleteCard: (cardId) =>
    set({
      lists: get().lists.map((list) => ({
        ...list,
        cards: list.cards?.filter((c) => c.id !== cardId) || [],
      })),
      selectedCard: get().selectedCard?.id === cardId ? null : get().selectedCard,
    }),

  updateList: (listId, data) =>
    set({
      lists: get().lists.map((list) => (list.id === listId ? { ...list, ...data } : list)),
    }),

  deleteList: (listId) =>
    set({ lists: get().lists.filter((list) => list.id !== listId) }),

  setSelectedCard: (card) => set({ selectedCard: card }),

  setLabels: (labels) => set({ labels }),
  setUsers: (users) => set({ users }),
  setLoading: (isLoading) => set({ isLoading }),
}));
