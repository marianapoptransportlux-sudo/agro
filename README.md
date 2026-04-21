# Agro Receptie MVP

MVP pentru un soft agro cu:

- bot Telegram pentru receptia de marfa
- dashboard web pentru vizualizare si operare
- API backend simplu cu stocare locala in JSON sau Supabase

## Stack

- Node.js + Express
- Telegraf
- dashboard HTML/CSS/JS servit static
- Supabase pentru persistenta in productie

## Pornire

1. Instaleaza dependentele:

   ```bash
   npm install
   ```

2. Copiaza configurarea:

   ```bash
   copy .env.example .env
   ```

3. Completeaza `TELEGRAM_BOT_TOKEN` in `.env`
4. Alege storage-ul:

   Pentru local:

   ```env
   STORAGE_DRIVER=local
   ```

   Pentru Supabase:

   ```env
   STORAGE_DRIVER=supabase
   SUPABASE_URL=https://your-project-ref.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

5. Daca folosesti Supabase, ruleaza SQL-ul din [supabase/schema.sql](./supabase/schema.sql) in SQL Editor.

6. Ruleaza aplicatia:

   ```bash
   npm run dev
   ```

7. Deschide dashboard-ul la `http://localhost:3000`

## Backup local

- Backup-urile pentru `.runtime-data` sunt salvate automat in `.runtime-data-backups`.
- Se pastreaza automat ultimele 7 versiuni.
- Listezi backup-urile disponibile cu:

  ```bash
  npm run backups:list
  ```

- Restaurezi un backup cu:

  ```bash
  npm run backups:restore -- 2026-04-18T09-39-55-265Z
  ```

## Utilizatori si roluri

- Utilizatorii sunt persistati in `.runtime-data/config.json`.
- Rolurile v1 sunt fixe si suportate oficial:
  - `operator`
  - `manager`
  - `accountant`
  - `admin`
- La prima initializare se creeaza un singur cont bootstrap:
  - username: `admin`
  - parola initiala: valoarea din `DEFAULT_USER_PASSWORD` (obligatoriu in productie). In dezvoltare se foloseste `Agro2026!` cu warning la consola.
  - la primul login flag-ul `requirePasswordChange` forteaza schimbarea parolei.
- Pentru administrare programatica exista endpoint-uri dedicate:
  - `GET /api/users`
  - `POST /api/users`
  - `PATCH /api/users/:id`

Exemplu creare utilizator:

```json
{
  "name": "Operator Siloz 1",
  "username": "operator.siloz1",
  "roleCode": "operator",
  "channel": "web",
  "active": true,
  "password": "ParolaTemporara123"
}
```

Exemplu schimbare rol sau dezactivare:

```json
{
  "name": "Operator Siloz 1",
  "username": "operator.siloz1",
  "roleCode": "manager",
  "channel": "web+telegram",
  "active": false,
  "changeReason": "Promovare sau suspendare temporara"
}
```

## Flux Telegram

1. Deschizi botul
2. Rulezi `/receptie`
3. Completezi pasii ceruti
4. Receptia ajunge in dashboard

## API

- `GET /api/receipts`
- `POST /api/receipts`
- `PATCH /api/receipts/:id/status`

## Observatii

- In modul local, datele sunt salvate in `.runtime-data/config.json` si `.runtime-data/receipts.json`.
- In modul Supabase, serverul foloseste cheia `SUPABASE_SERVICE_ROLE_KEY`, deci cheia ramane doar pe backend.
- Endpoint-ul `GET /api/health` iti arata storage-ul activ.

## Deploy pe Vercel

- Dashboard-ul static si API-ul pot fi deployate pe Vercel fara schimbari suplimentare.
- API-ul este expus prin fisierele din directorul `api/`.
- Pentru Vercel, configureaza in Project Settings -> Environment Variables:
  - `STORAGE_DRIVER=supabase`
  - `SUPABASE_URL=...`
  - `SUPABASE_SERVICE_ROLE_KEY=...`

Limitare actuala:

- Botul Telegram ruleaza in polling si foloseste sesiuni in memorie (`Map`), deci nu este potrivit pentru Vercel in forma actuala.
- Pentru a muta botul pe Vercel, trebuie trecut pe webhook si stocare persistenta a sesiunii in Supabase.

## Securitate (deployment public)

Inainte de a expune aplicatia in internet parcurge checklist-ul:

### Obligatoriu

- [ ] **`NODE_ENV=production`** — activeaza HTTPS redirect + HSTS + refuzul pornirii fara `DEFAULT_USER_PASSWORD`.
- [ ] **`DEFAULT_USER_PASSWORD`** — parola puternica pentru contul bootstrap `admin` (min. 12 caractere, litere+cifre+simbol, NU `Agro2026!`). La primul login, parola trebuie schimbata (flag `requirePasswordChange`).
- [ ] **HTTPS** — Vercel ofera automat. Pe VPS propriu foloseste Caddy sau nginx cu Let's Encrypt.
- [ ] **`ALLOWED_ORIGINS`** (optional) — lista de origini externe acceptate, separate prin virgula. Implicit se accepta doar same-origin. Seteaza aici domeniile publice (ex: `https://agro.exemplu.md`).
- [ ] **`SUPABASE_SERVICE_ROLE_KEY`** — tine-o doar in env vars secrete (Vercel Project Settings sau `.env` cu `.gitignore`). Nu include in frontend. Roteaza periodic.
- [ ] **`TELEGRAM_BOT_TOKEN`** — idem, doar in env vars secrete.
- [ ] **Administrare Telegram** — inainte de a publica botul, seteaza `telegramUserId` (numeric, imutabil) pe fiecare utilizator intern cu canal Telegram activ. Prima legare prin `/start` foloseste id-ul numeric din `ctx.from.id`; schimbarile ulterioare de Telegram username nu mai pot deturna contul.

### Protectii incluse in cod

- Rate limit pe `/api/auth/login` si `/api/auth/change-password` (max 20 incercari / 15 min / IP).
- Rate limit pe mutatii (`POST`/`PATCH`/`DELETE`) — max 120 cereri / min / user+IP.
- Login lockout per IP si per username (5 esuari / 15 min / bloc 15 min).
- CSRF-guard pe mutatii: accepta doar cereri cu `Origin`/`Referer` same-origin sau in `ALLOWED_ORIGINS`.
- HSTS + redirect HTTP -> HTTPS cand `NODE_ENV=production` (sau `FORCE_HTTPS=true`).
- CSP stricta (doar `self` pentru script-uri; fara inline), `X-Frame-Options: DENY`, `frame-ancestors 'none'`.
- Cookie de sesiune `HttpOnly`, `SameSite=Strict`, `Secure` in productie.
- Mascare automata a campurilor sensibile (`password*`, `token`, `apiKey`, `secret`) in audit log.
- Politica parolei: min 10 caractere strict + blacklist; min 6 in mod `lenient` doar pentru seed.
- Inactivity timeout 30 min pe sesiune; TTL absolut 12h.
- Permisiuni centralizate in `src/permissions.js` (capabilities per rol).

### Recomandari suplimentare

- Backup automat `.runtime-data/` (script existent `scripts/runtime-backup-cli.js`). Pentru Supabase foloseste point-in-time recovery.
- Monitorizeaza `GET /api/audit-logs` regulat pentru tranzactii neobisnuite.
- Deploy printr-un CI care ruleaza `npm test` inainte de publicare.
- Pentru acces extern, plaseaza aplicatia in spatele unui WAF (Cloudflare gratis, Vercel default) pentru filtrare de boti si DDoS.
- Limiteaza lista de IP-uri admin folosind reguli de firewall la nivel de infrastructura daca accesul admin e doar din birou.

### Ce nu e inclus (deferred)

- 2FA (TOTP) pentru admin — planificat.
- Rotatie automata a token-urilor / API key-urilor.
- Integrare cu un IdP extern (Google/Microsoft/SAML).
- Semnare criptografica a payload-urilor critice (recipe/livrare).
