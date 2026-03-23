from fastapi import APIRouter, Depends, HTTPException

from dependencies import get_current_user
import schemas
from agents import orchestrator_agent

router = APIRouter(tags=["chat"])


@router.post("/agents/chat", response_model=schemas.ChatResponse)
def chat_with_orchestrator(request: schemas.ChatRequest, user=Depends(get_current_user)):
    try:
        history = [{"role": m.role, "content": m.content} for m in request.history]
        result = orchestrator_agent.process_chat(request.message, history)
        return schemas.ChatResponse(
            intent=result.get("intent", "general_chat"),
            response=result.get("response", "I received your message."),
            extracted_data=result.get("extracted_data", ""),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Orchestrator error: {str(e)}")
