from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from typing import List
from app.database import get_db
from app import models, schemas

router = APIRouter()

@router.get("/board/{board_id}", response_model=List[schemas.List])
async def get_lists(board_id: str, db: Session = Depends(get_db)):
    lists = db.query(models.List).options(
        joinedload(models.List.cards)
    ).filter(models.List.board_id == board_id).order_by(models.List.position.asc()).all()
    return lists

@router.get("/{list_id}", response_model=schemas.List)
async def get_list(list_id: str, db: Session = Depends(get_db)):
    list_item = db.query(models.List).options(
        joinedload(models.List.cards)
    ).filter(models.List.id == list_id).first()
    if not list_item:
        raise HTTPException(status_code=404, detail="List not found")
    return list_item

@router.post("/", response_model=schemas.List, status_code=201)
async def create_list(list: schemas.ListCreate, db: Session = Depends(get_db)):
    # If position not provided, get max position and add 1
    board_id = list.boardId
    position = list.position
    if position is None:
        max_position = db.query(func.max(models.List.position)).filter(
            models.List.board_id == board_id
        ).scalar()
        position = (max_position + 1) if max_position is not None else 0
    
    db_list = models.List(
        title=list.title,
        board_id=board_id,
        position=position
    )
    db.add(db_list)
    db.commit()
    db.refresh(db_list)
    return db_list

@router.put("/{list_id}", response_model=schemas.List)
async def update_list(list_id: str, list_update: schemas.ListUpdate, db: Session = Depends(get_db)):
    db_list = db.query(models.List).filter(models.List.id == list_id).first()
    if not db_list:
        raise HTTPException(status_code=404, detail="List not found")
    
    update_data = list_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_list, field, value)
    
    db.commit()
    db.refresh(db_list)
    return db_list

@router.put("/reorder")
async def reorder_lists(reorder: dict, db: Session = Depends(get_db)):
    lists_data = reorder.get("lists", [])
    for item in lists_data:
        db_list = db.query(models.List).filter(models.List.id == item.get("id")).first()
        if db_list:
            db_list.position = item.get("position", db_list.position)
    db.commit()
    return {"message": "Lists reordered successfully"}

@router.delete("/{list_id}")
async def delete_list(list_id: str, db: Session = Depends(get_db)):
    db_list = db.query(models.List).filter(models.List.id == list_id).first()
    if not db_list:
        raise HTTPException(status_code=404, detail="List not found")
    
    db.delete(db_list)
    db.commit()
    return {"message": "List deleted successfully"}
