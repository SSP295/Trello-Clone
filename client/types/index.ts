export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: string;
  updatedAt?: string | null;
}

export interface Board {
  id: string;
  title: string;
  description?: string;
  background?: string;
  createdAt: string;
  updatedAt?: string | null;
  lists?: List[];
}

export interface List {
  id: string;
  title: string;
  position: number;
  boardId: string;
  createdAt: string;
  updatedAt?: string | null;
  cards?: Card[];
}

export interface Card {
  id: string;
  title: string;
  description?: string;
  position: number;
  coverImage?: string | null;
  dueDate?: string | null;
  listId: string;
  createdAt: string;
  updatedAt?: string | null;
  labels?: CardLabel[];
  members?: CardMember[];
  checklists?: Checklist[];
  attachments?: Attachment[];
  comments?: Comment[];
  list?: List;
}

export interface Label {
  id: string;
  name: string;
  color: string;
  boardId: string;
  createdAt: string;
  updatedAt?: string | null;
}

export interface CardLabel {
  id: string;
  cardId: string;
  labelId: string;
  label: Label;
}

export interface CardMember {
  id: string;
  cardId: string;
  userId: string;
  user: User;
}

export interface Checklist {
  id: string;
  title: string;
  cardId: string;
  position: number;
  createdAt: string;
  updatedAt?: string | null;
  items?: ChecklistItem[];
}

export interface ChecklistItem {
  id: string;
  text: string;
  isCompleted: boolean;
  position: number;
  checklistId: string;
  createdAt: string;
  updatedAt?: string | null;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size?: number;
  cardId: string;
  createdAt: string;
}

export interface Comment {
  id: string;
  text: string;
  cardId: string;
  userId: string;
  createdAt: string;
  updatedAt?: string | null;
  user: User;
}
