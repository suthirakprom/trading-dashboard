from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from dependencies.auth import get_current_user
from config.supabase import supabase

router = APIRouter(prefix="/journals", tags=["Trade Journals"])

class JournalCreate(BaseModel):
    symbol: str
    direction: str  # "Long" or "Short"
    entry_price: Optional[float] = None
    exit_price: Optional[float] = None
    stop_loss: Optional[float] = None
    take_profit: Optional[float] = None
    trade_size: Optional[float] = None
    trade_date: Optional[datetime] = None
    outcome: Optional[str] = None # "Win", "Loss", "Breakeven"
    status: str = "Open"
    notes: Optional[str] = None
    images: Optional[List[str]] = None

class JournalUpdate(BaseModel):
    symbol: Optional[str] = None
    direction: Optional[str] = None
    entry_price: Optional[float] = None
    exit_price: Optional[float] = None
    stop_loss: Optional[float] = None
    take_profit: Optional[float] = None
    trade_size: Optional[float] = None
    trade_date: Optional[datetime] = None
    outcome: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None
    images: Optional[List[str]] = None

@router.get("/")
async def get_journals(user_id: Optional[str] = None, user = Depends(get_current_user)):
    """
    Get journals. 
    If user_id is provided, fetch that user's journals (Public Read).
    If not, fetch current user's journals.
    """
    try:
        target_user_id = user_id if user_id else user.id
        
        response = supabase.table("trade_journals")\
            .select("*")\
            .eq("user_id", target_user_id)\
            .order("trade_date", desc=True)\
            .execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_journal(journal: JournalCreate, user = Depends(get_current_user)):
    """Create a new trade journal entry"""
    try:
        data = journal.model_dump()
        data["user_id"] = user.id
        # Ensure default trade_date if not provided
        if not data.get("trade_date"):
            data["trade_date"] = datetime.now().isoformat()
            
        response = supabase.table("trade_journals").insert(data).execute()
        return response.data[0] if response.data else None
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{journal_id}")
async def update_journal(journal_id: str, journal: JournalUpdate, user = Depends(get_current_user)):
    """Update a trade journal entry"""
    try:
        data = {k: v for k, v in journal.model_dump().items() if v is not None}
        response = supabase.table("trade_journals")\
            .update(data)\
            .eq("id", journal_id)\
            .eq("user_id", user.id)\
            .execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Journal not found")
        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{journal_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_journal(journal_id: str, user = Depends(get_current_user)):
    """Delete a trade journal entry"""
    try:
        response = supabase.table("trade_journals")\
            .delete()\
            .eq("id", journal_id)\
            .eq("user_id", user.id)\
            .execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Journal not found")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
