from fastapi import HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from config.supabase import supabase
import httpx

security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Validates the JWT token from the Authorization header.
    Returns the user data if valid.
    """
    token = credentials.credentials
    
    try:
        # Verify the token with Supabase
        user_response = supabase.auth.get_user(token)
        
        if not user_response or not user_response.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        return user_response.user
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"},
        )

async def get_current_admin(user = Depends(get_current_user)):
    """
    Validates that the current user has the 'admin' role.
    """
    try:
        # Fetch the user's profile to get the role
        # Note: We use the supabase client directly here because we trust the user object from get_current_user
        # but we need to verify the role from the 'profiles' table which is more secure than metadata if using table RLS
        
        profile_response = supabase.table("profiles").select("role").eq("id", user.id).execute()
        
        if not profile_response.data:
            # If no profile exists, they can't be an admin (or a valid user really)
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User profile not found",
            )
            
        role = profile_response.data[0].get("role")
        
        if role != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to perform this action",
            )
            
        return user
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error checking admin status: {str(e)}"
        )
