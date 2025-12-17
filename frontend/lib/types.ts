export interface User {
  _id: string;
  username: string;
  email: string;
  token?: string;
}

export interface Card {
  _id: string;
  title: string;
  description?: string;
  position: number;
  listId: string;
}

export interface List {
  _id: string;
  title: string;
  position: number;
  boardId: string;
  cards: Card[];
}

export interface Board {
  _id: string;
  title: string;
  user: string;
  lists: List[];
}