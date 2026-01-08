from __future__ import annotations

from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, Dict, Any
from datetime import datetime
from pydantic import field_serializer

# User schemas
class UserBase(BaseModel):
    name: str
    email: str
    avatar: Optional[str] = None

class UserCreate(UserBase):
    pass

class User(UserBase):
    id: str
    created_at: datetime = Field(alias="createdAt")
    updated_at: Optional[datetime] = Field(None, alias="updatedAt")
    
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

# Board schemas
class BoardBase(BaseModel):
    title: str
    description: Optional[str] = None
    background: Optional[str] = "#0079bf"

class BoardCreate(BoardBase):
    pass

class BoardUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    background: Optional[str] = None

class Board(BoardBase):
    id: str
    created_at: Optional[datetime] = Field(None, alias="createdAt")
    updated_at: Optional[datetime] = Field(None, alias="updatedAt")
    lists: list[List] = Field(default_factory=list)
    
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

# List schemas
class ListBase(BaseModel):
    title: str
    board_id: str = Field(alias="boardId")
    position: Optional[int] = None
    
    model_config = ConfigDict(populate_by_name=True)

class ListCreate(BaseModel):
    title: str
    boardId: str
    position: Optional[int] = None

class ListUpdate(BaseModel):
    title: Optional[str] = None
    position: Optional[int] = None

class ListReorder(BaseModel):
    lists: list[Dict[str, Any]] = Field(default_factory=list)

class List(ListBase):
    id: str
    position: int
    created_at: datetime = Field(alias="createdAt")
    updated_at: Optional[datetime] = Field(None, alias="updatedAt")
    cards: list[Card] = Field(default_factory=list)
    
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

class ListRef(BaseModel):
    id: str
    title: str
    position: int
    board_id: str = Field(alias="boardId")
    created_at: datetime = Field(alias="createdAt")
    updated_at: Optional[datetime] = Field(None, alias="updatedAt")

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

# Card schemas
class CardBase(BaseModel):
    title: str
    description: Optional[str] = None
    list_id: str = Field(alias="listId")
    position: Optional[int] = None
    due_date: Optional[datetime] = Field(None, alias="dueDate")
    cover_image: Optional[str] = Field(None, alias="coverImage")
    
    model_config = ConfigDict(populate_by_name=True)

class CardCreate(BaseModel):
    title: str
    description: Optional[str] = None
    listId: str
    position: Optional[int] = None
    dueDate: Optional[datetime] = None
    coverImage: Optional[str] = None

class CardUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    listId: Optional[str] = None
    position: Optional[int] = None
    dueDate: Optional[datetime] = None
    coverImage: Optional[str] = None

class CardMove(BaseModel):
    listId: str
    position: int

class CardReorder(BaseModel):
    cards: list[Dict[str, Any]] = Field(default_factory=list)

class Card(CardBase):
    id: str
    position: int
    created_at: datetime = Field(alias="createdAt")
    updated_at: Optional[datetime] = Field(None, alias="updatedAt")
    labels: list[CardLabel] = Field(default_factory=list)
    members: list[CardMember] = Field(default_factory=list)
    checklists: list[Checklist] = Field(default_factory=list)
    attachments: list[Attachment] = Field(default_factory=list)
    comments: list[Comment] = Field(default_factory=list)
    list: Optional[ListRef] = None
    
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

class CardInList(CardBase):
    id: str
    position: int
    created_at: datetime = Field(alias="createdAt")
    updated_at: Optional[datetime] = Field(None, alias="updatedAt")

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

# Label schemas
class LabelBase(BaseModel):
    name: str
    color: str
    board_id: str = Field(alias="boardId")
    
    model_config = ConfigDict(populate_by_name=True)

class LabelCreate(BaseModel):
    name: str
    color: str
    boardId: str

class LabelUpdate(BaseModel):
    name: Optional[str] = None
    color: Optional[str] = None

class Label(LabelBase):
    id: str
    created_at: datetime = Field(alias="createdAt")
    updated_at: Optional[datetime] = Field(None, alias="updatedAt")
    
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

class CardLabel(BaseModel):
    id: str
    card_id: str = Field(alias="cardId")
    label_id: str = Field(alias="labelId")
    label: Optional[Label] = None

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

class CardMember(BaseModel):
    id: str
    card_id: str = Field(alias="cardId")
    user_id: str = Field(alias="userId")
    user: Optional[User] = None

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

# Checklist schemas
class ChecklistItemBase(BaseModel):
    text: str
    position: Optional[int] = None

class ChecklistItemCreate(ChecklistItemBase):
    pass

class ChecklistItemUpdate(BaseModel):
    text: Optional[str] = None
    is_completed: Optional[bool] = Field(None, alias="isCompleted")
    position: Optional[int] = None

    model_config = ConfigDict(populate_by_name=True)

class ChecklistItem(ChecklistItemBase):
    id: str
    is_completed: bool = Field(alias="isCompleted")
    position: int
    checklist_id: str = Field(alias="checklistId")
    created_at: datetime = Field(alias="createdAt")
    updated_at: Optional[datetime] = Field(None, alias="updatedAt")
    
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

class ChecklistBase(BaseModel):
    title: str
    position: Optional[int] = None

class ChecklistCreate(ChecklistBase):
    pass

class ChecklistUpdate(BaseModel):
    title: Optional[str] = None

class Checklist(ChecklistBase):
    id: str
    card_id: str = Field(alias="cardId")
    position: int
    created_at: datetime = Field(alias="createdAt")
    updated_at: Optional[datetime] = Field(None, alias="updatedAt")
    items: list[ChecklistItem] = Field(default_factory=list)
    
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

# Comment schemas
class CommentBase(BaseModel):
    text: str
    user_id: str = Field(alias="userId")

    model_config = ConfigDict(populate_by_name=True)

class CommentCreate(CommentBase):
    pass

class CommentUpdate(BaseModel):
    text: str

class Comment(CommentBase):
    id: str
    card_id: str = Field(alias="cardId")
    created_at: datetime = Field(alias="createdAt")
    updated_at: Optional[datetime] = Field(None, alias="updatedAt")
    user: Optional[User] = None
    
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

# Attachment schemas
class Attachment(BaseModel):
    id: str
    name: str
    url: str
    type: str
    size: Optional[int] = None
    card_id: str = Field(alias="cardId")
    created_at: datetime = Field(alias="createdAt")
    
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

# Rebuild models to resolve forward references after all classes are defined
def _rebuild_models():
    Board.model_rebuild()
    List.model_rebuild()
    ListRef.model_rebuild()
    Card.model_rebuild()
    CardInList.model_rebuild()
    Label.model_rebuild()
    CardLabel.model_rebuild()
    CardMember.model_rebuild()
    ChecklistItem.model_rebuild()
    Checklist.model_rebuild()
    Comment.model_rebuild()
    Attachment.model_rebuild()
    User.model_rebuild()

_rebuild_models()
