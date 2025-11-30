# Colony OS Backend - Sensory Pulse Endpoint Specification

**Status:** ✅ **IMPLEMENTATION READY** - See `COLONY_OS_BACKEND_IMPLEMENTATION.py` for ready-to-paste FastAPI code

**Purpose:** This document specifies the `/sensory/pulse` endpoint that Zyeuté calls for AI processing.

---

## Endpoint Specification

### POST `/sensory/pulse`

**Description:** Receives text input from a Bee (Zyeuté), processes it through AI models, and returns classified analysis.

**Authentication:** Bearer token (Supabase JWT)

**Request Body:**
```json
{
  "text": "Wow, check cette poutine!",
  "beeId": "zyeute",
  "timestamp": "2025-01-20T12:00:00.000Z"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "analysis": {
    "topics": ["food", "quebec_culture", "enthusiasm"],
    "entities": ["poutine"],
    "keywords": ["poutine", "wow", "check"]
  },
  "category": "food",
  "sentiment": "positive",
  "language": "quebec_french",
  "metadata": {
    "confidence": 0.95,
    "processing_time_ms": 250,
    "model_used": "gemini-pro"
  }
}
```

**Response (Error - 400/500):**
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

---

## Implementation Guide

### Python/FastAPI Example

```python
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
import httpx
import os

router = APIRouter()

class SensoryPulseRequest(BaseModel):
    text: str
    beeId: str
    timestamp: str

class SensoryPulseResponse(BaseModel):
    success: bool
    analysis: Optional[dict] = None
    category: Optional[str] = None
    sentiment: Optional[str] = None
    language: Optional[str] = None
    metadata: Optional[dict] = None
    error: Optional[str] = None

@router.post("/sensory/pulse", response_model=SensoryPulseResponse)
async def sensory_pulse(
    request: SensoryPulseRequest,
    # Add auth dependency here
):
    """
    Process sensory input through AI models and return analysis.
    """
    try:
        # 1. Validate input
        if not request.text or len(request.text.strip()) == 0:
            raise HTTPException(status_code=400, detail="Text cannot be empty")
        
        # 2. Call LiteLLM for sentiment analysis
        sentiment = await analyze_sentiment(request.text)
        
        # 3. Detect language (Quebec French vs French vs English)
        language = detect_language(request.text)
        
        # 4. Categorize content
        category = await categorize_content(request.text)
        
        # 5. Extract entities and topics
        analysis = await extract_analysis(request.text)
        
        return SensoryPulseResponse(
            success=True,
            analysis=analysis,
            category=category,
            sentiment=sentiment,
            language=language,
            metadata={
                "confidence": 0.95,
                "processing_time_ms": 250,
                "model_used": "gemini-pro"
            }
        )
    except Exception as e:
        return SensoryPulseResponse(
            success=False,
            error=str(e)
        )

async def analyze_sentiment(text: str) -> str:
    """
    Use LiteLLM to analyze sentiment.
    Returns: 'positive', 'negative', or 'neutral'
    """
    litellm_url = os.getenv("LITELLM_URL", "http://localhost:4000")
    
    prompt = f"""Analyze the sentiment of this Quebec French text (Joual). 
    Respond with only: positive, negative, or neutral.
    
    Text: "{text}"
    """
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{litellm_url}/chat/completions",
            headers={
                "Authorization": f"Bearer {os.getenv('LITELLM_MASTER_KEY')}",
                "Content-Type": "application/json"
            },
            json={
                "model": "gemini-pro",
                "messages": [{"role": "user", "content": prompt}],
                "max_tokens": 10,
                "temperature": 0.3
            }
        )
        
        if response.status_code == 200:
            result = response.json()
            sentiment = result["choices"][0]["message"]["content"].strip().lower()
            return sentiment if sentiment in ["positive", "negative", "neutral"] else "neutral"
    
    return "neutral"

def detect_language(text: str) -> str:
    """
    Detect if text is Quebec French, French, or English.
    Returns: 'quebec_french', 'french', or 'english'
    """
    text_lower = text.lower()
    
    # Quebec French indicators
    quebec_indicators = ['tsé', 'pis', 'ben', 'là', 'faque', 'coudonc', 'check', 'wow']
    has_quebec = any(indicator in text_lower for indicator in quebec_indicators)
    
    if has_quebec:
        return "quebec_french"
    
    # Simple French detection (has French characters/words)
    french_words = ['cette', 'cette', 'pour', 'avec', 'dans', 'sur']
    has_french = any(word in text_lower for word in french_words)
    
    if has_french:
        return "french"
    
    return "english"

async def categorize_content(text: str) -> str:
    """
    Use AI to categorize content.
    Returns: 'food', 'event', 'culture', 'social', 'other'
    """
    litellm_url = os.getenv("LITELLM_URL", "http://localhost:4000")
    
    prompt = f"""Categorize this Quebec French text into one of these categories:
    - food
    - event
    - culture
    - social
    - other
    
    Respond with only the category name.
    
    Text: "{text}"
    """
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{litellm_url}/chat/completions",
            headers={
                "Authorization": f"Bearer {os.getenv('LITELLM_MASTER_KEY')}",
                "Content-Type": "application/json"
            },
            json={
                "model": "gemini-pro",
                "messages": [{"role": "user", "content": prompt}],
                "max_tokens": 10,
                "temperature": 0.3
            }
        )
        
        if response.status_code == 200:
            result = response.json()
            category = result["choices"][0]["message"]["content"].strip().lower()
            valid_categories = ["food", "event", "culture", "social", "other"]
            return category if category in valid_categories else "other"
    
    return "other"

async def extract_analysis(text: str) -> dict:
    """
    Extract topics, entities, and keywords from text.
    """
    # Simple keyword extraction (in production, use NER models)
    keywords = text.lower().split()
    
    # Detect entities (simple version)
    entities = []
    if "poutine" in text.lower():
        entities.append("poutine")
    
    # Detect topics
    topics = []
    if any(word in text.lower() for word in ["poutine", "manger", "restaurant"]):
        topics.append("food")
    if any(word in text.lower() for word in ["festival", "événement", "event"]):
        topics.append("event")
    if any(word in text.lower() for word in ["quebec", "québécois", "culture"]):
        topics.append("quebec_culture")
    
    return {
        "topics": topics,
        "entities": entities,
        "keywords": keywords[:10]  # Limit to 10 keywords
    }
```

---

## Integration Points

### 1. LiteLLM Integration
- Use LiteLLM for sentiment analysis and categorization
- Model: `gemini-pro` (or fallback to `gpt-3.5-turbo`)
- Endpoint: `POST /chat/completions`

### 2. Language Detection
- Simple heuristic-based (can be enhanced with proper language detection library)
- Priority: Quebec French > French > English

### 3. Categorization
- Use AI to categorize into: food, event, culture, social, other
- Can be enhanced with fine-tuned models later

### 4. Entity Extraction
- Simple keyword-based (can be enhanced with NER models)
- Extract Quebec-specific entities (poutine, festival, etc.)

---

## Error Handling

- **400 Bad Request:** Invalid input (empty text, malformed JSON)
- **401 Unauthorized:** Invalid or missing auth token
- **500 Internal Server Error:** AI service unavailable, processing error

---

## Performance Considerations

- **Target Response Time:** < 500ms
- **Caching:** Consider caching common phrases/patterns
- **Rate Limiting:** Implement per-bee rate limiting
- **Async Processing:** For complex analysis, consider async processing with webhooks

---

## Testing

### Test Cases

1. **Quebec French Input:**
   ```json
   {
     "text": "Wow, check cette poutine!",
     "beeId": "zyeute"
   }
   ```
   Expected: `category: "food"`, `sentiment: "positive"`, `language: "quebec_french"`

2. **English Input:**
   ```json
   {
     "text": "This is amazing!",
     "beeId": "zyeute"
   }
   ```
   Expected: `language: "english"`

3. **Empty Input:**
   ```json
   {
     "text": "",
     "beeId": "zyeute"
   }
   ```
   Expected: `400 Bad Request`

---

## Next Steps

1. **Implement endpoint** in Colony OS backend
2. **Test with Zyeuté** frontend
3. **Monitor performance** and adjust caching/rate limiting
4. **Enhance AI models** based on real usage patterns

---

**This specification ensures Zyeuté (the mouth) and Colony OS (the ears) speak the same language!** 🐝✨

