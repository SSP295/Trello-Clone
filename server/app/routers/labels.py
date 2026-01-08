from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app import models, schemas

router = APIRouter()

@router.get("/board/{board_id}", response_model=List[schemas.Label])
async def get_labels(board_id: str, db: Session = Depends(get_db)):
    labels = db.query(models.Label).filter(models.Label.board_id == board_id).order_by(models.Label.created_at.asc()).all()
    return labels

@router.post("/", response_model=schemas.Label, status_code=201)
async def create_label(label: schemas.LabelCreate, db: Session = Depends(get_db)):
    db_label = models.Label(
        name=label.name,
        color=label.color,
        board_id=label.boardId
    )
    db.add(db_label)
    db.commit()
    db.refresh(db_label)
    return db_label

@router.put("/{label_id}", response_model=schemas.Label)
async def update_label(label_id: str, label_update: schemas.LabelUpdate, db: Session = Depends(get_db)):
    db_label = db.query(models.Label).filter(models.Label.id == label_id).first()
    if not db_label:
        raise HTTPException(status_code=404, detail="Label not found")
    
    update_data = label_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_label, field, value)
    
    db.commit()
    db.refresh(db_label)
    return db_label

@router.delete("/{label_id}")
async def delete_label(label_id: str, db: Session = Depends(get_db)):
    db_label = db.query(models.Label).filter(models.Label.id == label_id).first()
    if not db_label:
        raise HTTPException(status_code=404, detail="Label not found")
    
    db.delete(db_label)
    db.commit()
    return {"message": "Label deleted successfully"}
