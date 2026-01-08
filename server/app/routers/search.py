from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from typing import List, Optional
from datetime import datetime, timedelta
from app.database import get_db
from app import models, schemas

router = APIRouter()

@router.get("/cards", response_model=List[schemas.Card])
async def search_cards(
    q: Optional[str] = Query(None, description="Search query"),
    label_id: Optional[str] = Query(None, description="Filter by label"),
    user_id: Optional[str] = Query(None, description="Filter by user"),
    due_date: Optional[str] = Query(None, description="Filter by due date (YYYY-MM-DD)"),
    board_id: Optional[str] = Query(None, description="Filter by board"),
    db: Session = Depends(get_db)
):
    query = db.query(models.Card)
    
    if board_id:
        query = query.join(models.List).filter(models.List.board_id == board_id)
    
    if q:
        query = query.filter(models.Card.title.ilike(f"%{q}%"))
    
    if label_id:
        query = query.join(models.CardLabel).filter(models.CardLabel.label_id == label_id)
    
    if user_id:
        query = query.join(models.CardMember).filter(models.CardMember.user_id == user_id)
    
    if due_date:
        try:
            date_obj = datetime.strptime(due_date, "%Y-%m-%d")
            next_day = date_obj + timedelta(days=1)
            query = query.filter(
                and_(
                    models.Card.due_date >= date_obj,
                    models.Card.due_date < next_day
                )
            )
        except ValueError:
            pass
    
    cards = query.order_by(models.Card.created_at.desc()).all()
    return cards
