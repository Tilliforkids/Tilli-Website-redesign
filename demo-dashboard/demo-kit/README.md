# Tilli teacher demo: demo kit

Files to show the teacher dashboard demo (`/demo-dashboard/en/` or `/demo-dashboard/es/`).
Everything here is made-up sample data for the demo class, **Grade 3 A (English: Heritage Oaks School · Spanish: Colegio Los Almendros, 3.º A)**. No real children.

> In the demo, uploads are **scripted**: Tilli always "reads" the same result for this class, whatever file you choose. These files are the realistic-looking ones to pick so the story matches what appears on screen.

## Files

| File | Use it in | What happens on screen |
|---|---|---|
| `attendance-today-grade3A-en.csv` / `-es.csv` | **My Garden → Attendance → Take attendance ▾ → Upload CSV or PDF** | Tilli reads the register (about 2 seconds) and fills in today: **2 absent, 1 late**, the same three children marked in this file (EN: Anika and Ira absent, Zara late · ES: Paula and Sara absent, Leo late). Check the list, press **Save**. The attendance heatmap, "x of 14 present", each child's attendance card and the Ask Tilli answer to "Who is absent today?" all update. |
| `attendance-term-grade3A-en.csv` / `-es.csv` | Show-and-tell only (open it in Excel/Sheets) | A whole-term register, P / A / L for 49 school days (8 Sep to 13 Nov 2026). It matches the pattern in the demo's attendance heatmap, so you can say "this is the kind of export Tilli takes in". |
| `roster-new-students-grade3A-en.csv` / `-es.csv` | **Students → Add students → Upload a CSV** | This one is **really read**: 4 new children appear on the review sheet, ready to add. Press **Plant students** and they join the class (with no scores yet). Refreshing the page resets the demo. |
| `worksheets/worksheet-word-problems-en.jpg` / `-es.jpg` (+ `.pdf`) | **Assess → Files & records → + Add a file**: type **Maths**, then **Upload your own** and choose this photo (the child is picked from the name on the sheet) | Tilli "reads" the photo (Reading the sheet… Marking each answer… Looking for patterns…), then shows **5/5** (it also marks questions 4 and 5, which the teacher hadn't ticked yet), what it noticed (the child crossed out a first try on 2 and 4 and fixed it: in English they added instead of multiplying, in Spanish they made carrying slips), the linked skill (**Metacognition**, with the child's level) and a next step. Tilli "reads" the name written on the sheet and picks that child for you: **Leo Mathew** (English) / **Mateo García** (Spanish). **Save to memory** adds it to the child's files, maths marks and memory layer, and Ask Tilli knows about it. |

## A 5-minute demo path

1. **Attendance**: My Garden → Take attendance ▾ → Upload CSV → choose `attendance-today-…csv` → Save.
2. **Worksheet photo**: Assess → Files & records → + Add a file → Maths → Upload your own → `worksheets/worksheet-word-problems-en.jpg` (or `-es.jpg`) → watch Tilli read it → Save to memory.
3. **Insights**: Class Skill Overview (top 3 skills that need support) → Growth over time (hover for numbers) → Perspectives tab (aligned or not).
4. **Ask Tilli**: open the yellow bubble or the Ask Tilli tab and **type**. Good ones to try:
   - "How is my class doing overall?" → then tap the suggested follow-ups
   - "How is *[child's name]* doing?"
   - "Who is absent today?" (after step 1)
   - A note, just typed like a message: "*[child]* got really upset at break today and shouted at a friend". Tilli shows its steps, sorts it into **Emotion Regulation**, and saves it to that child's memory.
   - Spanish: «¿Cómo va mi clase en general?», «¿Cómo va *[nombre]*?», «*[nombre]* hoy se ha enfadado mucho en el recreo».

## Notes

- Ask Tilli answers are written in advance (about 100 questions in English and Spanish) and computed from the demo class's data, so they stay true after you upload or save something. Nothing you type is sent anywhere.
- Hindi (`/demo-dashboard/hi/`) keeps the tap-to-ask questions.
- To start over, refresh the page (the demo keeps nothing).
