---
paths:
  - "docs/play/**/*.html"
  - "docs/play/**/*.js"
---

# Product language (load when product files are touched)

- Write to the player: banned families are design rationale, roadmap notes,
  plumbing terms, and the designer's flourish. Test: could a player tell
  what the sentence refers to from their screen alone? Gate: dev_voice=0.
- No em dashes, including &mdash;-style entities (the gate counts what the
  renderer emits). Replacement jobs (tools/emdash.py): separator → " · ",
  apposition → comma, restatement → colon, two clauses → two sentences.
  Fix data in the TABLES, never in build output.
- Personality lives in the coach and the taunts (characters); controls and
  rules lines just say the thing.
- The coach never assumes the player knows the game, never says what is
  always true, and every tip hands the player something they can do from
  the screen in front of them (Aaron 09-05 on "Your slide. Their setup is
  done, now move ONE defender to answer it, up to his full range": *"your
  wording is as though they understand the game, and they don't... 'answer
  it' is always a word that should be avoided... if it's the full range no
  matter when they move, then you don't need to say it... this is not a good
  coach tip at all because it doesn't really give the player anything"*).
  Rows 230, 232.
- The UI never explains, justifies or celebrates itself. No line about why
  a thing is the way it is, no flourish about what the game is doing for
  you (Aaron 09-05 on the names screen's "the machine names itself" and
  "Your name rides the whole night": *"UI does not need to be explaining
  itself to the player. It doesn't need to be justifying and celebrating
  itself... I feel like that's a flaw you have where you keep trying to
  make people celebrate you. The UI just needs to be clean."*). A screen
  says what to do and nothing about itself. Row 244.
