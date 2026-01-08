from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List
from app.database import get_db
from app import models, schemas

router = APIRouter()

@router.get("/", response_model=List[schemas.Board])
async def get_boards(db: Session = Depends(get_db)):
    boards = db.query(models.Board).options(
        joinedload(models.Board.lists)
        .joinedload(models.List.cards)
        .joinedload(models.Card.labels)
        .joinedload(models.CardLabel.label),
        joinedload(models.Board.lists)
        .joinedload(models.List.cards)
        .joinedload(models.Card.members)
        .joinedload(models.CardMember.user),
        joinedload(models.Board.lists)
        .joinedload(models.List.cards)
        .joinedload(models.Card.checklists)
        .joinedload(models.Checklist.items),
        joinedload(models.Board.lists)
        .joinedload(models.List.cards)
        .joinedload(models.Card.attachments),
        joinedload(models.Board.lists)
        .joinedload(models.List.cards)
        .joinedload(models.Card.comments)
        .joinedload(models.Comment.user),
    ).order_by(models.Board.created_at.desc()).all()
    return boards

@router.get("/{board_id}", response_model=schemas.Board)
async def get_board(board_id: str, db: Session = Depends(get_db)):
    board = db.query(models.Board).options(
        joinedload(models.Board.lists)
        .joinedload(models.List.cards)
        .joinedload(models.Card.labels)
        .joinedload(models.CardLabel.label),
        joinedload(models.Board.lists)
        .joinedload(models.List.cards)
        .joinedload(models.Card.members)
        .joinedload(models.CardMember.user),
        joinedload(models.Board.lists)
        .joinedload(models.List.cards)
        .joinedload(models.Card.checklists)
        .joinedload(models.Checklist.items),
        joinedload(models.Board.lists)
        .joinedload(models.List.cards)
        .joinedload(models.Card.attachments),
        joinedload(models.Board.lists)
        .joinedload(models.List.cards)
        .joinedload(models.Card.comments)
        .joinedload(models.Comment.user),
    ).filter(models.Board.id == board_id).first()
    if not board:
        raise HTTPException(status_code=404, detail="Board not found")
    return board

@router.post("/", response_model=schemas.Board, status_code=201)
async def create_board(board: schemas.BoardCreate, db: Session = Depends(get_db)):
    try:
        db_board = models.Board(**board.dict())
        db.add(db_board)
        db.commit()
        db.refresh(db_board)
        return db_board
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create board: {str(e)}")

@router.put("/{board_id}", response_model=schemas.Board)
async def update_board(board_id: str, board_update: schemas.BoardUpdate, db: Session = Depends(get_db)):
    db_board = db.query(models.Board).filter(models.Board.id == board_id).first()
    if not db_board:
        raise HTTPException(status_code=404, detail="Board not found")
    
    update_data = board_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_board, field, value)
    
    db.commit()
    db.refresh(db_board)
    return db_board

@router.delete("/{board_id}")
async def delete_board(board_id: str, db: Session = Depends(get_db)):
    db_board = db.query(models.Board).filter(models.Board.id == board_id).first()
    if not db_board:
        raise HTTPException(status_code=404, detail="Board not found")
    
    db.delete(db_board)
    db.commit()
    return {"message": "Board deleted successfully"}
