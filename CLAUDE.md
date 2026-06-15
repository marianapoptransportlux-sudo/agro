# AgroProfit (`agro`) — context pentru Claude Code

Aplicație MVP pentru o firmă agro: **bot Telegram** pentru recepția de marfă + **dashboard web** pentru operare, cu **API Express** și stocare în JSON local sau Supabase. Deploy pe Vercel: `agroprofit-plus.vercel.app`.

## Stack & structură
- Node.js + Express (`src/server.js` = entry point).
- Telegraf (bot Telegram, polling, sesiuni in-memory `Map` — NU e pregătit pentru serverless/Vercel în forma actuală).
- Dashboard static în `public/`.
- API în `src/*-handlers.js`; rutele + rolurile în `src/server.js`.
- Stocare prin `src/storage.js`, care alege driverul după `STORAGE_DRIVER`:
  - `local` → `src/local-storage.js` (fișiere JSON în `.runtime-data/`).
  - `supabase` → `src/supabase-storage.js`.

## ⚠️ Arhitectură de știut (ca să nu greșești)
- Driverul `supabase` e **hibrid**: persistă în cloud **doar `receipts`** (recepțiile). Tot restul — utilizatori, parole, config, livrări, procesări, tranzacții, reclamații, audit, setări — deleagă către `local-storage` (deci e **local**, pe fiecare mașină). Vezi `module.exports` din `supabase-storage.js`.
  - Consecință: o entitate/câmp nou care trebuie să fie comun în cloud trebuie tratat **explicit** în AMBELE drivere + `supabase/schema.sql`, altfel rămâne doar local.
- Login-ul merge și în modul supabase pentru că utilizatorii vin din `local-storage` (cont bootstrap `admin` / `Agro2026!`, cu schimbare parolă la prima logare).
- Roluri: `operator`, `manager`, `accountant`, `accountant-sef`, `admin`, `control`. Accesul pe rute = `requireRoles([...])`.
- Secretele stau în `.env` (în `.gitignore`). `SUPABASE_SERVICE_ROLE_KEY` are acces total (sare peste RLS) → **doar pe server**, niciodată în client.
- Migrări: `storage.runMigrationIfNeeded()` la boot; schimbările de schemă necesită și `supabase/schema.sql`.

## 🔒 Revizuire obligatorie (NU se sare)
După **ORICE** modificare de cod (Edit / Write / MultiEdit) și **întotdeauna înainte de publicare/deploy**, lansează în paralel cei 3 revizori:
1. `architecture-reviewer`
2. `performance-reviewer`
3. `security-reviewer`

Reguli:
- Raportează constatările pe **severitate**: Critical / High / Medium / Low, fiecare cu `fișier:linie` și fix concret.
- **NU** declara „gata" și **NU** publica dacă există **Critical** sau **High** nerezolvate — întâi se repară.
- Hook-ul `PostToolUse` (`.claude/settings.json`) reamintește automat după fiecare editare; mandatul rămâne valabil chiar dacă hook-ul nu se declanșează.

## 📤 Publicare / Deploy
- „**publică**" = `git add` + `commit` + `push` pe `main` → Vercel redeployează `agroprofit-plus.vercel.app` în ~1 minut.
- Înainte de `git push`: cei 3 revizori trebuie să fi rulat pe ultimele modificări, fără Critical/High rămase.

## 👩‍💻 Cum lucrează Mariana (regulile lui Ion)
Respectă și reamintește acest flux (vezi și agentul `workflow-coach`):
1. **Plan Mode întâi** — la orice schimbare ne-trivială, arată întâi planul (ce fișiere atingi, ce schimbi, ce efect), **fără** să modifici încă.
2. Ea se uită și **aprobă** (sau cere corecții).
3. Abia apoi **execuți** (Bypass — fără confirmări la fiecare pas).
4. **„publică"** la final.

Dacă primești o cerere ne-trivială fără plan, **propune întâi planul**. Amintește-i că deploy-ul se face cu un singur cuvânt: „publică".
