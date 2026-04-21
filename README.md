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
  - parola initiala: `Agro2026!` sau valoarea din `DEFAULT_USER_PASSWORD`
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
