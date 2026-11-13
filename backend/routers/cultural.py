import json
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from backend.database import get_db
from backend.models import (
    ScriptureChapter,
    ScripturePassage,
    PuranicStory,
    ScriptureBookmark,
    ReadingProgress,
    User
)
from backend.schemas import (
    ScriptureChapterResponse,
    ScripturePassageResponse,
    PuranicStoryResponse,
    ScriptureBookmarkCreate,
    ScriptureBookmarkResponse,
    ReadingProgressUpdate,
    ReadingProgressResponse,
    ScriptureQARequest,
    ScriptureQAResponse
)
from backend.auth import get_current_user

router = APIRouter(prefix="/api/cultural", tags=["Cultural & Spiritual Wisdom"])

# --- Bhagavad Gita Endpoints ---

@router.get("/gita/chapters", response_model=List[ScriptureChapterResponse])
def get_all_gita_chapters(db: Session = Depends(get_db)):
    chapters = db.query(ScriptureChapter).order_by(ScriptureChapter.chapter_number.asc()).all()
    results = []
    for ch in chapters:
        themes = json.loads(ch.key_themes) if ch.key_themes else []
        results.append(
            ScriptureChapterResponse(
                id=ch.id,
                scripture_name=ch.scripture_name,
                chapter_number=ch.chapter_number,
                title_sanskrit=ch.title_sanskrit,
                title_transliteration=ch.title_transliteration,
                title_english=ch.title_english,
                title_hindi=ch.title_hindi,
                title_telugu=ch.title_telugu,
                verse_count=ch.verse_count,
                summary_en=ch.summary_en,
                summary_hi=ch.summary_hi,
                summary_te=ch.summary_te,
                key_themes=themes,
                source_edition=ch.source_edition,
                verification_status=ch.verification_status
            )
        )
    return results

@router.get("/gita/chapters/{chapter_number}", response_model=ScriptureChapterResponse)
def get_gita_chapter_detail(chapter_number: int, db: Session = Depends(get_db)):
    ch = db.query(ScriptureChapter).filter(ScriptureChapter.chapter_number == chapter_number).first()
    if not ch:
        raise HTTPException(status_code=404, detail=f"Bhagavad Gita Chapter {chapter_number} not found.")
    themes = json.loads(ch.key_themes) if ch.key_themes else []
    return ScriptureChapterResponse(
        id=ch.id,
        scripture_name=ch.scripture_name,
        chapter_number=ch.chapter_number,
        title_sanskrit=ch.title_sanskrit,
        title_transliteration=ch.title_transliteration,
        title_english=ch.title_english,
        title_hindi=ch.title_hindi,
        title_telugu=ch.title_telugu,
        verse_count=ch.verse_count,
        summary_en=ch.summary_en,
        summary_hi=ch.summary_hi,
        summary_te=ch.summary_te,
        key_themes=themes,
        source_edition=ch.source_edition,
        verification_status=ch.verification_status
    )

@router.get("/gita/chapters/{chapter_number}/verses", response_model=List[ScripturePassageResponse])
def get_chapter_verses(chapter_number: int, db: Session = Depends(get_db)):
    verses = db.query(ScripturePassage).filter(
        ScripturePassage.chapter_number == chapter_number
    ).order_by(ScripturePassage.verse_number.asc()).all()
    return verses

@router.get("/gita/verses/{chapter_number}/{verse_number}", response_model=ScripturePassageResponse)
def get_specific_verse(chapter_number: int, verse_number: int, db: Session = Depends(get_db)):
    verse = db.query(ScripturePassage).filter(
        ScripturePassage.chapter_number == chapter_number,
        ScripturePassage.verse_number == verse_number
    ).first()
    if not verse:
        raise HTTPException(
            status_code=404,
            detail=f"Verse BG {chapter_number}.{verse_number} not found in the verified repository."
        )
    return verse

@router.get("/gita/daily-verse", response_model=ScripturePassageResponse)
def get_daily_verse(db: Session = Depends(get_db)):
    # Retrieve recommended daily contemplation verse or default to 2.47
    verse = db.query(ScripturePassage).filter(ScripturePassage.is_daily_recommended == True).first()
    if not verse:
        verse = db.query(ScripturePassage).filter(
            ScripturePassage.chapter_number == 2,
            ScripturePassage.verse_number == 47
        ).first()
    if not verse:
        verse = db.query(ScripturePassage).first()
    if not verse:
        raise HTTPException(status_code=404, detail="No verified verses available.")
    return verse

@router.get("/gita/search", response_model=List[ScripturePassageResponse])
def search_gita_verses(
    q: Optional[str] = Query(None, description="Search term in translation, commentary, or transliteration"),
    chapter: Optional[int] = Query(None, description="Filter by chapter number 1-18"),
    db: Session = Depends(get_db)
):
    query = db.query(ScripturePassage)
    if chapter:
        query = query.filter(ScripturePassage.chapter_number == chapter)

    if q and q.strip():
        term = f"%{q.strip().lower()}%"
        query = query.filter(
            or_(
                ScripturePassage.translation_en.ilike(term),
                ScripturePassage.translation_hi.ilike(term),
                ScripturePassage.translation_te.ilike(term),
                ScripturePassage.transliteration.ilike(term),
                ScripturePassage.commentary_summary.ilike(term),
                ScripturePassage.source_identifier.ilike(term)
            )
        )

    results = query.order_by(ScripturePassage.chapter_number.asc(), ScripturePassage.verse_number.asc()).limit(30).all()
    return results

# --- Puranas & Traditional Stories Endpoints ---

@router.get("/puranas", response_model=List[PuranicStoryResponse])
def get_puranic_stories(
    purana_name: Optional[str] = Query(None, description="Filter by Purana e.g. Bhagavata Purana"),
    db: Session = Depends(get_db)
):
    query = db.query(PuranicStory)
    if purana_name and purana_name != "all":
        query = query.filter(PuranicStory.purana_name.ilike(f"%{purana_name}%"))
    return query.order_by(PuranicStory.id.asc()).all()

@router.get("/puranas/{story_id}", response_model=PuranicStoryResponse)
def get_puranic_story_detail(story_id: int, db: Session = Depends(get_db)):
    story = db.query(PuranicStory).filter(PuranicStory.id == story_id).first()
    if not story:
        raise HTTPException(status_code=404, detail="Traditional Puranic story not found.")
    return story

# --- Bookmarks & Reading Progress ---

@router.get("/bookmarks", response_model=List[ScriptureBookmarkResponse])
def get_scripture_bookmarks(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(ScriptureBookmark).filter(
        ScriptureBookmark.user_id == current_user.id
    ).order_by(ScriptureBookmark.created_at.desc()).all()

@router.post("/bookmarks", response_model=ScriptureBookmarkResponse, status_code=status.HTTP_201_CREATED)
def add_scripture_bookmark(
    payload: ScriptureBookmarkCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    bm = ScriptureBookmark(
        user_id=current_user.id,
        scripture_type=payload.scripture_type,
        item_id=payload.item_id,
        verse_reference=payload.verse_reference,
        notes=payload.notes
    )
    db.add(bm)
    db.commit()
    db.refresh(bm)
    return bm

@router.delete("/bookmarks/{bookmark_id}")
def delete_scripture_bookmark(
    bookmark_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    bm = db.query(ScriptureBookmark).filter(
        ScriptureBookmark.id == bookmark_id,
        ScriptureBookmark.user_id == current_user.id
    ).first()
    if not bm:
        raise HTTPException(status_code=404, detail="Bookmark not found or access denied.")
    db.delete(bm)
    db.commit()
    return {"message": "Bookmark removed successfully."}

@router.get("/progress", response_model=ReadingProgressResponse)
def get_reading_progress(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    prog = db.query(ReadingProgress).filter(
        ReadingProgress.user_id == current_user.id
    ).first()
    if not prog:
        # Create initial record
        prog = ReadingProgress(
            user_id=current_user.id,
            scripture_name="Bhagavad Gita",
            chapter_number=1,
            verse_number=1,
            completed_chapters_json="[]"
        )
        db.add(prog)
        db.commit()
        db.refresh(prog)

    completed = json.loads(prog.completed_chapters_json) if prog.completed_chapters_json else []
    return ReadingProgressResponse(
        id=prog.id,
        user_id=prog.user_id,
        scripture_name=prog.scripture_name,
        chapter_number=prog.chapter_number,
        verse_number=prog.verse_number,
        completed_chapters=completed,
        last_read_at=prog.last_read_at
    )

@router.post("/progress", response_model=ReadingProgressResponse)
def update_reading_progress(
    payload: ReadingProgressUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    prog = db.query(ReadingProgress).filter(
        ReadingProgress.user_id == current_user.id,
        ReadingProgress.scripture_name == payload.scripture_name
    ).first()

    completed = []
    if prog:
        completed = json.loads(prog.completed_chapters_json) if prog.completed_chapters_json else []
        prog.chapter_number = payload.chapter_number
        prog.verse_number = payload.verse_number
        prog.last_read_at = datetime.utcnow()
    else:
        prog = ReadingProgress(
            user_id=current_user.id,
            scripture_name=payload.scripture_name,
            chapter_number=payload.chapter_number,
            verse_number=payload.verse_number,
            completed_chapters_json="[]"
        )
        db.add(prog)

    if payload.completed_chapter and payload.chapter_number not in completed:
        completed.append(payload.chapter_number)
        prog.completed_chapters_json = json.dumps(completed)

    db.commit()
    db.refresh(prog)

    return ReadingProgressResponse(
        id=prog.id,
        user_id=prog.user_id,
        scripture_name=prog.scripture_name,
        chapter_number=prog.chapter_number,
        verse_number=prog.verse_number,
        completed_chapters=completed,
        last_read_at=prog.last_read_at
    )

# --- Retrieval-Based Scripture QA ---

@router.post("/ask", response_model=ScriptureQAResponse)
def ask_scripture_question(payload: ScriptureQARequest, db: Session = Depends(get_db)):
    q = payload.question.lower().strip()
    user_lang = payload.language or "en"
    citations = []
    scripture_snippets = []

    # 1. Search verified local Gita passages
    gita_matches = []
    if "duty" in q or "karma" in q or "action" in q or "work" in q:
        gita_matches = db.query(ScripturePassage).filter(
            ScripturePassage.chapter_number == 2,
            ScripturePassage.verse_number == 47
        ).all()
    elif "peace" in q or "mind" in q or "meditation" in q:
        gita_matches = db.query(ScripturePassage).filter(
            ScripturePassage.chapter_number == 6
        ).limit(2).all()
    elif "devotion" in q or "bhakti" in q or "surrender" in q:
        gita_matches = db.query(ScripturePassage).filter(
            ScripturePassage.chapter_number.in_([9, 12, 18])
        ).limit(2).all()
    elif "soul" in q or "atman" in q or "death" in q or "rebirth" in q:
        gita_matches = db.query(ScripturePassage).filter(
            ScripturePassage.chapter_number == 2,
            ScripturePassage.verse_number.in_([20, 22])
        ).all()
    else:
        # Fallback text query
        term = f"%{q[:15]}%"
        gita_matches = db.query(ScripturePassage).filter(
            or_(
                ScripturePassage.translation_en.ilike(term),
                ScripturePassage.commentary_summary.ilike(term)
            )
        ).limit(2).all()

    # 2. Search Puranas if relevant
    purana_matches = []
    if "dhruva" in q or "steadfast" in q or "star" in q:
        purana_matches = db.query(PuranicStory).filter(PuranicStory.title.ilike("%Dhruva%")).all()
    elif "prahlada" in q or "narasimha" in q or "faith" in q:
        purana_matches = db.query(PuranicStory).filter(PuranicStory.title.ilike("%Prahlada%")).all()
    elif "markandeya" in q or "shiva" in q or "longevity" in q:
        purana_matches = db.query(PuranicStory).filter(PuranicStory.purana_name.ilike("%Markandeya%")).all()

    for m in gita_matches:
        citations.append({
            "source": f"Bhagavad Gita {m.chapter_number}.{m.verse_number}",
            "edition": m.source_edition,
            "verification_status": m.verification_status
        })
        text_trans = m.translation_hi if user_lang == "hi" else (m.translation_te if user_lang == "te" else m.translation_en)
        scripture_snippets.append(f"[{m.source_identifier}] Sanskrit: {m.sanskrit_devanagari} — Translation: \"{text_trans}\"")

    for p in purana_matches:
        citations.append({
            "source": f"{p.purana_name} ({p.source_reference})",
            "edition": p.source_edition,
            "verification_status": p.verification_status
        })
        story_t = p.story_text_hi if user_lang == "hi" else (p.story_text_te if user_lang == "te" else p.story_text_en)
        scripture_snippets.append(f"[{p.title} - {p.purana_name}] {story_t[:200]}...")

    if not citations:
        return ScriptureQAResponse(
            answer=(
                "We searched the verified local scriptural repository for your query, but no exact matching passage or verified traditional reference was retrieved. "
                "In accordance with our strict accuracy standard, LifeBridge AI does not invent or fabricate scripture, verse numbers, or traditional stories. "
                "You may explore Chapter 2 (Sankhya Yoga), Chapter 3 (Karma Yoga), or browse our Puranic library."
            ),
            source_citations=[],
            scripture_text_referenced=None,
            commentary_distinction="No verified scriptural passage matched; speculation avoided.",
            confidence_status="limited_evidence_in_library"
        )

    # Structured answer with clear distinction between text and commentary
    if user_lang == "hi":
        answer_body = (
            f"प्रामाणिक संदर्भों के अनुसार:\n\n"
            f"मूल शास्त्र श्लोक/कथा:\n{chr(10).join(scripture_snippets)}\n\n"
            f"व्याख्या एवं दार्शनिक महत्व:\n"
            f"यह उपदेश कर्तव्यपरायणता, निष्काम कर्म और आत्म-संयम पर केंद्रित है।"
        )
    elif user_lang == "te":
        answer_body = (
            f"ప్రామాణిక గ్రంథ ఆధారాల ప్రకారం:\n\n"
            f"మూల శ్లోకం / కథ:\n{chr(10).join(scripture_snippets)}\n\n"
            f"తాత్పర్యం మరియు దార్శనిక విశేషం:\n"
            f"ఈ సందేశం నిష్కామ కర్మ, కర్తవ్య నిర్వహణ మరియు స్థితప్రజ్ఞతను తెలియజేస్తుంది."
        )
    else:
        answer_body = (
            f"Based on our verified scriptural library:\n\n"
            f"--- Original Scripture & Translation ---\n{chr(10).join(scripture_snippets)}\n\n"
            f"--- Commentary & Philosophical Analysis ---\n"
            f"The referenced verses emphasize duty without attachment to outcomes (Nishkama Karma), "
            f"mindful self-discipline, and inner clarity. Different traditions (Advaita, Vishishtadvaita) emphasize "
            f"either knowledge of the unattached Self or devotional surrender to the Supreme Divine."
        )

    return ScriptureQAResponse(
        answer=answer_body,
        source_citations=citations,
        scripture_text_referenced="\n".join(scripture_snippets),
        commentary_distinction="Original scripture verse and word-meaning is separated from philosophical commentaries (Advaita/Vishishtadvaita).",
        confidence_status="verified_source_found"
    )
