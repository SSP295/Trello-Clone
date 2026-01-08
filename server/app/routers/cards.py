from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from typing import List, Optional
import os
import shutil
from datetime import datetime
from app.database import get_db
from app import models, schemas

router = APIRouter()

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.get("/list/{list_id}", response_model=List[schemas.Card])
async def get_cards(list_id: str, db: Session = Depends(get_db)):
    cards = db.query(models.Card).options(
        joinedload(models.Card.labels).joinedload(models.CardLabel.label),
        joinedload(models.Card.members).joinedload(models.CardMember.user)
    ).filter(models.Card.list_id == list_id).order_by(models.Card.position.asc()).all()
    return cards

@router.get("/{card_id}", response_model=schemas.Card)
async def get_card(card_id: str, db: Session = Depends(get_db)):
    card = db.query(models.Card).options(
        joinedload(models.Card.list).joinedload(models.List.board),
        joinedload(models.Card.labels).joinedload(models.CardLabel.label),
        joinedload(models.Card.members).joinedload(models.CardMember.user),
        joinedload(models.Card.checklists).joinedload(models.Checklist.items),
        joinedload(models.Card.attachments),
        joinedload(models.Card.comments).joinedload(models.Comment.user)
    ).filter(models.Card.id == card_id).first()
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")
    return card

@router.post("/", response_model=schemas.Card, status_code=201)
async def create_card(card: schemas.CardCreate, db: Session = Depends(get_db)):
    # If position not provided, get max position and add 1
    list_id = card.listId
    position = card.position
    if position is None:
        max_position = db.query(func.max(models.Card.position)).filter(
            models.Card.list_id == list_id
        ).scalar()
        position = (max_position + 1) if max_position is not None else 0
    
    db_card = models.Card(
        title=card.title,
        description=card.description,
        list_id=list_id,
        position=position,
        due_date=card.dueDate,
        cover_image=card.coverImage
    )
    db.add(db_card)
    db.commit()
    db.refresh(db_card)
    return db_card

@router.put("/{card_id}", response_model=schemas.Card)
async def update_card(card_id: str, card_update: schemas.CardUpdate, db: Session = Depends(get_db)):
    db_card = db.query(models.Card).filter(models.Card.id == card_id).first()
    if not db_card:
        raise HTTPException(status_code=404, detail="Card not found")
    
    update_data = card_update.dict(exclude_unset=True)
    # Map camelCase to snake_case
    field_mapping = {
        "listId": "list_id",
        "dueDate": "due_date",
        "coverImage": "cover_image"
    }
    
    for field, value in update_data.items():
        db_field = field_mapping.get(field, field)
        setattr(db_card, db_field, value)
    
    db.commit()
    db.refresh(db_card)
    return db_card

@router.put("/{card_id}/move", response_model=schemas.Card)
async def move_card(card_id: str, move: schemas.CardMove, db: Session = Depends(get_db)):
    db_card = db.query(models.Card).filter(models.Card.id == card_id).first()
    if not db_card:
        raise HTTPException(status_code=404, detail="Card not found")
    
    db_card.list_id = move.listId
    db_card.position = move.position
    db.commit()
    db.refresh(db_card)
    return db_card

@router.put("/reorder")
async def reorder_cards(reorder: dict, db: Session = Depends(get_db)):
    cards_data = reorder.get("cards", [])
    for item in cards_data:
        db_card = db.query(models.Card).filter(models.Card.id == item.get("id")).first()
        if db_card:
            if "listId" in item:
                db_card.list_id = item["listId"]
            if "position" in item:
                db_card.position = item["position"]
    db.commit()
    return {"message": "Cards reordered successfully"}

@router.post("/{card_id}/labels")
async def add_label_to_card(card_id: str, label_data: dict, db: Session = Depends(get_db)):
    db_card = db.query(models.Card).filter(models.Card.id == card_id).first()
    if not db_card:
        raise HTTPException(status_code=404, detail="Card not found")
    
    # Check if label already exists
    existing = db.query(models.CardLabel).filter(
        models.CardLabel.card_id == card_id,
        models.CardLabel.label_id == label_data["labelId"]
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Label already attached to card")
    
    card_label = models.CardLabel(card_id=card_id, label_id=label_data["labelId"])
    db.add(card_label)
    db.commit()
    db.refresh(card_label)
    return card_label

@router.delete("/{card_id}/labels/{label_id}")
async def remove_label_from_card(card_id: str, label_id: str, db: Session = Depends(get_db)):
    card_label = db.query(models.CardLabel).filter(
        models.CardLabel.card_id == card_id,
        models.CardLabel.label_id == label_id
    ).first()
    
    if not card_label:
        raise HTTPException(status_code=404, detail="Label not found on card")
    
    db.delete(card_label)
    db.commit()
    return {"message": "Label removed successfully"}

@router.post("/{card_id}/members")
async def add_member_to_card(card_id: str, member_data: dict, db: Session = Depends(get_db)):
    db_card = db.query(models.Card).filter(models.Card.id == card_id).first()
    if not db_card:
        raise HTTPException(status_code=404, detail="Card not found")
    
    # Check if member already exists
    existing = db.query(models.CardMember).filter(
        models.CardMember.card_id == card_id,
        models.CardMember.user_id == member_data["userId"]
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Member already assigned to card")
    
    card_member = models.CardMember(card_id=card_id, user_id=member_data["userId"])
    db.add(card_member)
    db.commit()
    db.refresh(card_member)
    return card_member

@router.delete("/{card_id}/members/{user_id}")
async def remove_member_from_card(card_id: str, user_id: str, db: Session = Depends(get_db)):
    card_member = db.query(models.CardMember).filter(
        models.CardMember.card_id == card_id,
        models.CardMember.user_id == user_id
    ).first()
    
    if not card_member:
        raise HTTPException(status_code=404, detail="Member not found on card")
    
    db.delete(card_member)
    db.commit()
    return {"message": "Member removed successfully"}

@router.post("/{card_id}/checklists", response_model=schemas.Checklist, status_code=201)
async def create_checklist(card_id: str, checklist: schemas.ChecklistCreate, db: Session = Depends(get_db)):
    # If position not provided, get max position and add 1
    if checklist.position is None:
        max_position = db.query(func.max(models.Checklist.position)).filter(
            models.Checklist.card_id == card_id
        ).scalar()
        checklist.position = (max_position + 1) if max_position is not None else 0
    
    checklist_data = checklist.dict()
    checklist_data["card_id"] = card_id
    db_checklist = models.Checklist(**checklist_data)
    db.add(db_checklist)
    db.commit()
    db.refresh(db_checklist)
    return db_checklist

@router.put("/checklists/{checklist_id}", response_model=schemas.Checklist)
async def update_checklist(checklist_id: str, checklist_update: schemas.ChecklistUpdate, db: Session = Depends(get_db)):
    db_checklist = db.query(models.Checklist).filter(models.Checklist.id == checklist_id).first()
    if not db_checklist:
        raise HTTPException(status_code=404, detail="Checklist not found")
    
    update_data = checklist_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_checklist, field, value)
    
    db.commit()
    db.refresh(db_checklist)
    return db_checklist

@router.delete("/checklists/{checklist_id}")
async def delete_checklist(checklist_id: str, db: Session = Depends(get_db)):
    db_checklist = db.query(models.Checklist).filter(models.Checklist.id == checklist_id).first()
    if not db_checklist:
        raise HTTPException(status_code=404, detail="Checklist not found")
    
    db.delete(db_checklist)
    db.commit()
    return {"message": "Checklist deleted successfully"}

@router.post("/checklists/{checklist_id}/items", response_model=schemas.ChecklistItem, status_code=201)
async def create_checklist_item(checklist_id: str, item: schemas.ChecklistItemCreate, db: Session = Depends(get_db)):
    # If position not provided, get max position and add 1
    if item.position is None:
        max_position = db.query(func.max(models.ChecklistItem.position)).filter(
            models.ChecklistItem.checklist_id == checklist_id
        ).scalar()
        item.position = (max_position + 1) if max_position is not None else 0
    
    item_data = item.dict()
    item_data["checklist_id"] = checklist_id
    db_item = models.ChecklistItem(**item_data)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.put("/checklist-items/{item_id}", response_model=schemas.ChecklistItem)
async def update_checklist_item(item_id: str, item_update: schemas.ChecklistItemUpdate, db: Session = Depends(get_db)):
    db_item = db.query(models.ChecklistItem).filter(models.ChecklistItem.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Checklist item not found")
    
    update_data = item_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_item, field, value)
    
    db.commit()
    db.refresh(db_item)
    return db_item

@router.delete("/checklist-items/{item_id}")
async def delete_checklist_item(item_id: str, db: Session = Depends(get_db)):
    db_item = db.query(models.ChecklistItem).filter(models.ChecklistItem.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Checklist item not found")
    
    db.delete(db_item)
    db.commit()
    return {"message": "Checklist item deleted successfully"}

@router.post("/{card_id}/attachments", response_model=schemas.Attachment, status_code=201)
async def upload_attachment(card_id: str, file: UploadFile = File(...), db: Session = Depends(get_db)):
    db_card = db.query(models.Card).filter(models.Card.id == card_id).first()
    if not db_card:
        raise HTTPException(status_code=404, detail="Card not found")
    
    # Validate file type
    allowed_types = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf', 
                     'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Invalid file type")
    
    # Save file
    file_ext = os.path.splitext(file.filename)[1]
    unique_filename = f"{datetime.now().timestamp()}-{os.urandom(8).hex()}{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Get file size
    file_size = os.path.getsize(file_path)
    
    # Create attachment record
    # In production, use full URL. For now, use relative path
    file_url = f"/uploads/{unique_filename}"
    attachment = models.Attachment(
        name=file.filename,
        url=file_url,
        type=file.content_type or "application/octet-stream",
        size=file_size,
        card_id=card_id
    )
    db.add(attachment)
    db.commit()
    db.refresh(attachment)
    return attachment

@router.delete("/attachments/{attachment_id}")
async def delete_attachment(attachment_id: str, db: Session = Depends(get_db)):
    db_attachment = db.query(models.Attachment).filter(models.Attachment.id == attachment_id).first()
    if not db_attachment:
        raise HTTPException(status_code=404, detail="Attachment not found")
    
    # Delete file
    file_path = os.path.join(UPLOAD_DIR, os.path.basename(db_attachment.url))
    if os.path.exists(file_path):
        os.remove(file_path)
    
    db.delete(db_attachment)
    db.commit()
    return {"message": "Attachment deleted successfully"}

@router.post("/{card_id}/comments", response_model=schemas.Comment, status_code=201)
async def create_comment(card_id: str, comment: schemas.CommentCreate, db: Session = Depends(get_db)):
    db_card = db.query(models.Card).filter(models.Card.id == card_id).first()
    if not db_card:
        raise HTTPException(status_code=404, detail="Card not found")
    
    comment_data = comment.dict()
    comment_data["card_id"] = card_id
    db_comment = models.Comment(**comment_data)
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)
    return db_comment

@router.put("/comments/{comment_id}", response_model=schemas.Comment)
async def update_comment(comment_id: str, comment_update: schemas.CommentUpdate, db: Session = Depends(get_db)):
    db_comment = db.query(models.Comment).filter(models.Comment.id == comment_id).first()
    if not db_comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    db_comment.text = comment_update.text
    db.commit()
    db.refresh(db_comment)
    return db_comment

@router.delete("/comments/{comment_id}")
async def delete_comment(comment_id: str, db: Session = Depends(get_db)):
    db_comment = db.query(models.Comment).filter(models.Comment.id == comment_id).first()
    if not db_comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    db.delete(db_comment)
    db.commit()
    return {"message": "Comment deleted successfully"}

@router.delete("/{card_id}")
async def delete_card(card_id: str, db: Session = Depends(get_db)):
    db_card = db.query(models.Card).filter(models.Card.id == card_id).first()
    if not db_card:
        raise HTTPException(status_code=404, detail="Card not found")
    
    db.delete(db_card)
    db.commit()
    return {"message": "Card deleted successfully"}
