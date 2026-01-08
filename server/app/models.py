from sqlalchemy import Column, String, Integer, DateTime, Boolean, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import uuid
import os

def generate_uuid():
    return str(uuid.uuid4())

# SQLite doesn't support timezone-aware datetimes, so we use a workaround
from dotenv import load_dotenv
load_dotenv()

database_url = os.getenv("DATABASE_URL", "sqlite:///./trello_clone.db")
if database_url.startswith("sqlite"):
    from sqlalchemy import DateTime as DateTimeType
    DateTime = DateTimeType
else:
    from sqlalchemy import DateTime as DateTimeType
    DateTime = DateTimeType(timezone=True)

class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    avatar = Column(String, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
    
    card_assignments = relationship("CardMember", back_populates="user", cascade="all, delete-orphan")
    comments = relationship("Comment", back_populates="user", cascade="all, delete-orphan")

class Board(Base):
    __tablename__ = "boards"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    background = Column(String, default="#0079bf")
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
    
    lists = relationship("List", back_populates="board", cascade="all, delete-orphan", order_by="List.position")

class List(Base):
    __tablename__ = "lists"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    title = Column(String, nullable=False)
    position = Column(Integer, nullable=False)
    board_id = Column(String, ForeignKey("boards.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
    
    board = relationship("Board", back_populates="lists")
    cards = relationship("Card", back_populates="list", cascade="all, delete-orphan", order_by="Card.position")

class Card(Base):
    __tablename__ = "cards"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    position = Column(Integer, nullable=False)
    cover_image = Column(String, nullable=True)
    due_date = Column(DateTime, nullable=True)
    list_id = Column(String, ForeignKey("lists.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
    
    list = relationship("List", back_populates="cards")
    labels = relationship("CardLabel", back_populates="card", cascade="all, delete-orphan")
    members = relationship("CardMember", back_populates="card", cascade="all, delete-orphan")
    checklists = relationship("Checklist", back_populates="card", cascade="all, delete-orphan", order_by="Checklist.position")
    attachments = relationship("Attachment", back_populates="card", cascade="all, delete-orphan")
    comments = relationship("Comment", back_populates="card", cascade="all, delete-orphan", order_by="Comment.created_at.desc()")

class Label(Base):
    __tablename__ = "labels"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    color = Column(String, nullable=False)
    board_id = Column(String, ForeignKey("boards.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
    
    cards = relationship("CardLabel", back_populates="label", cascade="all, delete-orphan")

class CardLabel(Base):
    __tablename__ = "card_labels"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    card_id = Column(String, ForeignKey("cards.id", ondelete="CASCADE"), nullable=False)
    label_id = Column(String, ForeignKey("labels.id", ondelete="CASCADE"), nullable=False)
    
    card = relationship("Card", back_populates="labels")
    label = relationship("Label", back_populates="cards")

class CardMember(Base):
    __tablename__ = "card_members"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    card_id = Column(String, ForeignKey("cards.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    card = relationship("Card", back_populates="members")
    user = relationship("User", back_populates="card_assignments")

class Checklist(Base):
    __tablename__ = "checklists"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    title = Column(String, nullable=False)
    card_id = Column(String, ForeignKey("cards.id", ondelete="CASCADE"), nullable=False)
    position = Column(Integer, nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
    
    card = relationship("Card", back_populates="checklists")
    items = relationship("ChecklistItem", back_populates="checklist", cascade="all, delete-orphan", order_by="ChecklistItem.position")

class ChecklistItem(Base):
    __tablename__ = "checklist_items"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    text = Column(String, nullable=False)
    is_completed = Column(Boolean, default=False)
    position = Column(Integer, nullable=False)
    checklist_id = Column(String, ForeignKey("checklists.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
    
    checklist = relationship("Checklist", back_populates="items")

class Attachment(Base):
    __tablename__ = "attachments"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    url = Column(String, nullable=False)
    type = Column(String, nullable=False)
    size = Column(Integer, nullable=True)
    card_id = Column(String, ForeignKey("cards.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    
    card = relationship("Card", back_populates="attachments")

class Comment(Base):
    __tablename__ = "comments"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    text = Column(Text, nullable=False)
    card_id = Column(String, ForeignKey("cards.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
    
    card = relationship("Card", back_populates="comments")
    user = relationship("User", back_populates="comments")
