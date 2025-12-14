# Think n' Tinker Curriculum Plan

## Overview
This curriculum follows spaced repetition principles with progressive difficulty across all subjects. Each section builds on previous knowledge while introducing new concepts gradually.

---

## Subject 1: Alphabet

### Section 1 — Introduction to Vowels
**Target Concepts:** A, E, I, O, U  
**Total Levels:** 10  
**Learning Focus:**
- Letter recognition (uppercase & lowercase)
- Phonics sound only (short vowel sounds)
- Image association

**Spaced Repetition Strategy:**
- **Levels 1-3:** Introduce A & E (2 vowels)
- **Levels 4-6:** Introduce I & O (A & E still appear)
- **Levels 7-8:** Introduce U (all vowels appear together)
- **Levels 9-10:** Mixed vowel review (no new content, confidence building)

**Game Type Distribution:**
- phonics (5 levels): Letter sound introduction
- image (1 level): Visual association
- tracing (1 level): Motor skill development
- cards (1 level): Memory and recognition
- matching (1 level): Challenge mode
- mixed (1 level): Comprehensive review

---

### Section 2 — Introduction to Consonants (A-D)
**Target Concepts:** A, B, C, D  
**Total Levels:** 10  
**Learning Focus:**
- Letter names + phonics
- Beginning sounds
- Image matching

**Spaced Repetition Strategy:**
- Vowels from Section 1 appear as distractors throughout
- A is reused intentionally to bridge vowel → consonant transition
- Progressive introduction: A → B → C → D
- Each new letter builds on previous knowledge

**Game Type Distribution:**
- phonics (4 levels): Sound introduction for B, C, D
- image (1 level): Visual learning
- cards (1 level): Memory practice
- tracing (1 level): Writing practice
- sound (1 level): Auditory discrimination
- matching (1 level): Challenge mode
- mixed (1 level): Final assessment

---

## Subject 2: Numbers

### Section 1 — Introduction to Numbers 1-3
**Target Concepts:** 1, 2, 3  
**Total Levels:** 10  
**Learning Focus:**
- Number recognition
- Counting objects
- Quantity comparison

**Spaced Repetition Strategy:**
- **Levels 1-3:** Number 1 only (mastery before moving on)
- **Levels 4-6:** Numbers 1 & 2 (comparing two quantities)
- **Levels 7-8:** Numbers 1, 2 & 3 (all three together)
- **Levels 9-10:** Mixed counting challenges (review and confidence)

**Game Type Distribution:**
- counting (7 levels): Core number learning
- dragndrop (3 levels): Interactive manipulation

---

### Section 2 — Numbers 4-6
**Target Concepts:** 4, 5, 6  
**Total Levels:** 10  
**Learning Focus:**
- Recognize numbers 4-6
- Count larger quantities
- Review numbers 1-3

**Spaced Repetition Strategy:**
- Level 1 reviews 1-3 before introducing new numbers
- Numbers 1-3 appear in review mini-tasks throughout
- Counting always includes earlier numbers for reinforcement
- Progressive introduction: 4 → 5 → 6

**Game Type Distribution:**
- counting (7 levels): Primary learning method
- dragndrop (3 levels): Interactive practice

---

## Subject 3: Colors

### Section 1 — Primary Colors
**Target Concepts:** Red, Blue, Yellow  
**Total Levels:** 10  
**Learning Focus:**
- Visual identification
- Matching
- Simple naming

**Spaced Repetition Strategy:**
- Each level reuses all learned colors
- No color appears only once
- Progressive complexity from single color focus to mixed challenges
- Red → Blue → Red+Blue → Yellow → All Three

**Game Type Distribution:**
- colorMultipleChoice (4 levels): Core recognition
- rocket (4 levels): Speed and accuracy
- matching (2 levels): Memory and association

---

## Subject 4: Shapes

### Section 1 — Basic Shapes
**Target Concepts:** Circle, Square, Triangle  
**Total Levels:** 10  
**Learning Focus:**
- Shape recognition
- Real-world object association
- Visual comparison

**Spaced Repetition Strategy:**
- Each level reuses all learned shapes
- Progressive complexity from single to multiple shapes
- Circle → Square → Circle+Square → Triangle → All Three
- Later levels increase speed and variety

**Game Type Distribution:**
- shapesMultipleChoice (4 levels): Shape identification
- rocketShapes (6 levels): Speed challenges and pattern recognition

---

## Level Design Principles (Applied Across All Sections)

### Progressive Difficulty Structure:
1. **Levels 1-3:** Single or two targets, minimal distractions, foundational learning
2. **Levels 4-7:** Multiple targets, mixed game types, building confidence
3. **Levels 8-10:** Review, challenge modes, mastery assessment

### Key Design Features:
- **Level 1:** Always introduces a single new concept in isolation
- **Early Levels:** Guided interaction with immediate feedback
- **Mid Levels:** Mix game types to maintain engagement
- **Late Levels:** Increase complexity and speed requirements
- **Final Level:** Comprehensive review with "Master" or "Star" designation

### Spaced Repetition Implementation:
- Previously learned concepts appear as distractors in choices
- Review levels strategically placed before introducing new concepts
- No concept is taught once and forgotten
- Each new section begins with a review of prior knowledge

---

## Data Structure Features

### Database-Ready Format:
- ✅ Matches Firestore hierarchical structure
- ✅ Subject → Section → Level organization
- ✅ Each level includes complete stage data
- ✅ Icon sets specified for UI consistency
- ✅ Game types align with implemented form components

### CRUD-Friendly Design:
- ✅ Unique IDs for all entities (subject ID, section ID, level index)
- ✅ Metadata included (descriptions, titles, learning focus)
- ✅ Easy to extend with new sections or levels
- ✅ Supports all game types in the CMS forms

### Validation Checklist:
- [ ] All game types match implemented forms (phonics, image, tracing, cards, sound, catching, matching, mixed, counting, dragndrop, colorMultipleChoice, rocket, shapesMultipleChoice, rocketShapes)
- [ ] All stages have required fields for their game type
- [ ] Choices include correct answers
- [ ] Level indices are sequential (1-10)
- [ ] Section metadata is complete
- [ ] Icon names are valid MaterialCommunityIcons

---

## Future Expansion Support

This structure easily supports:
- **New Sections:** Add new consonant groups (E-H, I-L, etc.)
- **Advanced Numbers:** Continue with 7-10, 11-20, etc.
- **Secondary Colors:** Green, Orange, Purple
- **Complex Shapes:** Rectangle, Oval, Pentagon, etc.
- **New Game Types:** Can be added without restructuring
- **Difficulty Levels:** Can adjust stage complexity per level

---

## Import Instructions

1. **Validate Data:** Review `curriculum-data.json` for accuracy
2. **Clear Testing Data:** Remove current test levels from Firestore
3. **Import Process:** Use CMS or write script to import JSON data
4. **Verification:** Use "View Levels" to confirm all data is present
5. **Testing:** Play through sample levels in the app to verify gameplay

---

## Summary Statistics

- **Total Subjects:** 4 (Alphabet, Numbers, Colors, Shapes)
- **Total Sections:** 5 (2 Alphabet, 2 Numbers, 1 Colors, 1 Shapes)
- **Total Levels:** 50 (10 per section)
- **Game Type Variety:** 14 unique game types used
- **Average Stages per Level:** 2-5 stages (scales with complexity)
- **Spaced Repetition:** Consistent across all subjects

---

## Notes for Database Import

When importing to Firestore:
- Use subject ID as document ID (e.g., "alphabet", "numbers")
- Create subcollection "sections" under each subject
- Create subcollection "levels" under each section
- Ensure `createdAt` and `updatedAt` timestamps are added
- Verify all icon names exist in MaterialCommunityIcons
- Test one complete section before bulk import
