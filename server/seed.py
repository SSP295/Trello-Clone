import os
import sys
from datetime import datetime, timedelta
from dotenv import load_dotenv

# Add parent directory to path
sys.path.insert(0, os.path.dirname(__file__))

load_dotenv()

from app.database import SessionLocal, engine, Base
from app import models

# Create tables
Base.metadata.create_all(bind=engine)

db = SessionLocal()

def seed_database():
    print("Seeding database...")
    
    # Create default users
    user1 = db.query(models.User).filter(models.User.email == "user@example.com").first()
    if not user1:
        user1 = models.User(
            name="John Doe",
            email="user@example.com",
            avatar="https://ui-avatars.com/api/?name=John+Doe&background=0079bf&color=fff"
        )
        db.add(user1)
        db.commit()
        db.refresh(user1)
    
    user2 = db.query(models.User).filter(models.User.email == "jane@example.com").first()
    if not user2:
        user2 = models.User(
            name="Jane Smith",
            email="jane@example.com",
            avatar="https://ui-avatars.com/api/?name=Jane+Smith&background=eb5a46&color=fff"
        )
        db.add(user2)
        db.commit()
        db.refresh(user2)
    
    user3 = db.query(models.User).filter(models.User.email == "bob@example.com").first()
    if not user3:
        user3 = models.User(
            name="Bob Johnson",
            email="bob@example.com",
            avatar="https://ui-avatars.com/api/?name=Bob+Johnson&background=00c2e0&color=fff"
        )
        db.add(user3)
        db.commit()
        db.refresh(user3)
    
    # Create boards
    boards_data = [
        {
            "title": "My Project Board",
            "description": "A sample project management board",
            "background": "#0079bf"
        },
        {
            "title": "Marketing Campaign",
            "description": "Track marketing tasks and campaigns",
            "background": "#eb5a46"
        },
        {
            "title": "Product Development",
            "description": "Manage product roadmap and features",
            "background": "#61bd4f"
        },
        {
            "title": "Design System",
            "description": "UI/UX design components and guidelines",
            "background": "#c377e0"
        }
    ]
    
    boards = []
    for board_data in boards_data:
        board = db.query(models.Board).filter(models.Board.title == board_data["title"]).first()
        if not board:
            board = models.Board(**board_data)
            db.add(board)
            db.commit()
            db.refresh(board)
        boards.append(board)
    
    # Use first board for detailed seeding
    board = boards[0]
    
    # Create labels
    labels_data = [
        {"name": "Frontend", "color": "#61bd4f"},
        {"name": "Backend", "color": "#f2d600"},
        {"name": "Bug", "color": "#eb5a46"},
        {"name": "Feature", "color": "#c377e0"},
    ]
    
    labels = []
    for label_data in labels_data:
        label = db.query(models.Label).filter(
            models.Label.name == label_data["name"],
            models.Label.board_id == board.id
        ).first()
        if not label:
            label = models.Label(**label_data, board_id=board.id)
            db.add(label)
            db.commit()
            db.refresh(label)
        labels.append(label)
    
    # Create lists
    lists_data = [
        {"title": "To Do", "position": 0},
        {"title": "In Progress", "position": 1},
        {"title": "Done", "position": 2},
    ]
    
    todo_list = None
    in_progress_list = None
    done_list = None
    
    for list_data in lists_data:
        list_item = db.query(models.List).filter(
            models.List.title == list_data["title"],
            models.List.board_id == board.id
        ).first()
        if not list_item:
            list_item = models.List(**list_data, board_id=board.id)
            db.add(list_item)
            db.commit()
            db.refresh(list_item)
        
        if list_data["title"] == "To Do":
            todo_list = list_item
        elif list_data["title"] == "In Progress":
            in_progress_list = list_item
        elif list_data["title"] == "Done":
            done_list = list_item
    
    # Create cards
    cards_data = [
        {
            "title": "Design user interface",
            "description": "Create mockups and wireframes for the main dashboard",
            "position": 0,
            "list_id": todo_list.id if todo_list else None,
            "due_date": datetime.now() + timedelta(days=7)
        },
        {
            "title": "Implement authentication",
            "description": "Set up user authentication and authorization",
            "position": 1,
            "list_id": todo_list.id if todo_list else None,
        },
        {
            "title": "Build API endpoints",
            "description": "Create RESTful API for boards, lists, and cards",
            "position": 0,
            "list_id": in_progress_list.id if in_progress_list else None,
            "due_date": datetime.now() + timedelta(days=3)
        },
        {
            "title": "Setup database",
            "description": "Configure PostgreSQL and create schema",
            "position": 0,
            "list_id": done_list.id if done_list else None,
        },
    ]
    
    created_cards = []
    for card_data in cards_data:
        if not card_data["list_id"]:
            continue
        card = db.query(models.Card).filter(
            models.Card.title == card_data["title"],
            models.Card.list_id == card_data["list_id"]
        ).first()
        if not card:
            card = models.Card(**card_data)
            db.add(card)
            db.commit()
            db.refresh(card)
        created_cards.append(card)
    
    if len(created_cards) >= 4:
        card1, card2, card3, card4 = created_cards[0], created_cards[1], created_cards[2], created_cards[3]
        
        # Add labels to cards
        card_labels_data = [
            (card1.id, labels[0].id),  # Frontend
            (card1.id, labels[3].id),  # Feature
            (card2.id, labels[1].id),  # Backend
            (card2.id, labels[3].id),  # Feature
            (card3.id, labels[1].id),  # Backend
            (card4.id, labels[1].id),  # Backend
        ]
        
        for card_id, label_id in card_labels_data:
            existing = db.query(models.CardLabel).filter(
                models.CardLabel.card_id == card_id,
                models.CardLabel.label_id == label_id
            ).first()
            if not existing:
                card_label = models.CardLabel(card_id=card_id, label_id=label_id)
                db.add(card_label)
        
        # Add members to cards
        card_members_data = [
            (card1.id, user1.id),
            (card1.id, user2.id),
            (card2.id, user1.id),
            (card3.id, user2.id),
            (card3.id, user3.id),
            (card4.id, user1.id),
        ]
        
        for card_id, user_id in card_members_data:
            existing = db.query(models.CardMember).filter(
                models.CardMember.card_id == card_id,
                models.CardMember.user_id == user_id
            ).first()
            if not existing:
                card_member = models.CardMember(card_id=card_id, user_id=user_id)
                db.add(card_member)
        
        # Create checklists
        checklist1 = db.query(models.Checklist).filter(
            models.Checklist.title == "Design Tasks",
            models.Checklist.card_id == card1.id
        ).first()
        if not checklist1:
            checklist1 = models.Checklist(
                title="Design Tasks",
                position=0,
                card_id=card1.id
            )
            db.add(checklist1)
            db.commit()
            db.refresh(checklist1)
            
            # Add checklist items
            items_data = [
                {"text": "Create wireframes", "position": 0, "is_completed": False},
                {"text": "Design color scheme", "position": 1, "is_completed": True},
                {"text": "Create component library", "position": 2, "is_completed": False},
            ]
            for item_data in items_data:
                item = models.ChecklistItem(checklist_id=checklist1.id, **item_data)
                db.add(item)
        
        checklist2 = db.query(models.Checklist).filter(
            models.Checklist.title == "API Tasks",
            models.Checklist.card_id == card3.id
        ).first()
        if not checklist2:
            checklist2 = models.Checklist(
                title="API Tasks",
                position=0,
                card_id=card3.id
            )
            db.add(checklist2)
            db.commit()
            db.refresh(checklist2)
            
            # Add checklist items
            items_data = [
                {"text": "Design API schema", "position": 0, "is_completed": True},
                {"text": "Implement endpoints", "position": 1, "is_completed": False},
                {"text": "Write tests", "position": 2, "is_completed": False},
            ]
            for item_data in items_data:
                item = models.ChecklistItem(checklist_id=checklist2.id, **item_data)
                db.add(item)
        
        # Create comments
        comments_data = [
            {"text": "Great progress on the design!", "card_id": card1.id, "user_id": user2.id},
            {"text": "Remember to add error handling", "card_id": card3.id, "user_id": user1.id},
            {"text": "Database setup completed successfully", "card_id": card4.id, "user_id": user1.id},
        ]
        
        for comment_data in comments_data:
            existing = db.query(models.Comment).filter(
                models.Comment.text == comment_data["text"],
                models.Comment.card_id == comment_data["card_id"]
            ).first()
            if not existing:
                comment = models.Comment(**comment_data)
                db.add(comment)
    
    db.commit()
    print("Database seeded successfully!")

if __name__ == "__main__":
    seed_database()
    db.close()
