from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List, Optional
from dependencies.auth import get_current_admin, get_current_user
from config.supabase import supabase

router = APIRouter(prefix="/users", tags=["Users"])

class UserRoleUpdate(BaseModel):
    role: str

class UserProfile(BaseModel):
    id: str
    email: Optional[str] = None
    role: str
    created_at: str

@router.get("/", response_model=List[UserProfile])
async def list_users(admin = Depends(get_current_admin)):
    """
    List all users. Only accessible by admins.
    """
    try:
        response = supabase.table("profiles").select("*").order("created_at", desc=True).execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{user_id}", response_model=UserProfile)
async def get_user_details(user_id: str, admin = Depends(get_current_admin)):
    """
    Get details of a specific user. Only accessible by admins.
    """
    try:
        response = supabase.table("profiles").select("*").eq("id", user_id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="User not found")
        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{user_id}/role", response_model=UserProfile)
async def update_user_role(user_id: str, role_update: UserRoleUpdate, admin = Depends(get_current_admin)):
    """
    Update a user's role. Only accessible by admins.
    """
    if role_update.role not in ["admin", "user"]:
        raise HTTPException(status_code=400, detail="Invalid role. Must be 'admin' or 'user'")
        
    try:
        response = supabase.table("profiles").update({"role": role_update.role}).eq("id", user_id).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="User not found")
            
        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
