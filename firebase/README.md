# Backend Firebase — Ago Log

Proiect: `ago-log` · Regiune funcții: `europe-west1` · Plan: **Blaze** (cu alertă de buget)

## Ce conține

| Fișier | Rol |
|---|---|
| `functions/src/otp.js` | `sendOtp` / `verifyOtp`: login cu cod de 6 cifre pe email (Resend) → custom token |
| `functions/src/ai.js` | `extractEntryFromImage`: completare automată din poză (OpenAI). Înlocuiește `handleEntryImage`. |
| `functions/src/payments.js` | `revenuecatWebhook`: un singur webhook RevenueCat. Înlocuiește `on-success-payment` și `on-fail-payment`. |
| `functions/src/notifications.js` | `sendNotifications`: cron zilnic la 07:00 ora României. O intrare cu `notifyDaysBefore = N` primește câte o notificare în fiecare zi din ultimele N zile, în ziua expirării și încă 3 zile după (push Expo + email + o notificare în aplicație per intrare, actualizată zilnic). `sendTestNotification`: push + email de test pentru userul logat. |
| `functions/src/insights.js` | `sendWeeklyInsights`: luni la 10:00, o notă personalizată per user, generată cu gpt-5-mini + căutare web (taxe, asigurări obligatorii, termene din țara userului), cu surse. Userii fără nimic adăugat primesc un îndemn simplu, fără AI. Cost estimat ~2 cenți/user/săptămână. |
| `functions/src/messages.js` | Textele trimise de backend, în engleză și română (după `user.language`) |
| `functions/src/account.js` | `deleteAccount`: șterge datele, pozele și contul userului |
| `firestore.rules`, `storage.rules` | Fiecare user are acces doar la datele lui. `plan`, `status` și `email` se modifică doar de pe server. |
| `firestore.indexes.json` | Indexurile compuse de care au nevoie interogările |

## Setup (o singură dată)

1. **Firebase console** → proiectul `ago-log`:
   - Upgrade la **Blaze**, apoi în Google Cloud Billing → Budgets & alerts pui o alertă (ex. 1 €)
   - Activezi **Authentication** (fără provider: login-ul folosește custom token), **Firestore** (locație `eur3` sau `europe-west1`) și **Storage**
   - Project settings → Your apps → **Add app → Web**. Copiezi `appId` în `EXPO_PUBLIC_FIREBASE_APP_ID`, sau direct în `firebase.ts`.
2. **Permisiune pentru custom token:** în Google Cloud → IAM, dai service account-ului
   `PROJECT_NUMBER-compute@developer.gserviceaccount.com` rolul **Service Account Token Creator**.
   Fără el, `verifyOtp` dă eroarea `iam.serviceAccounts.signBlob`.
3. **Resend** (resend.com, gratuit până la 3.000 de emailuri pe lună): verifici domeniul `gengraphic.de` și creezi o cheie API.
4. Instalezi CLI-ul și te loghezi:
   ```bash
   npm i -g firebase-tools
   ```
   ```bash
   firebase login
   ```
5. Setezi secretele:
   ```bash
   firebase functions:secrets:set RESEND_API_KEY
   ```
   ```bash
   firebase functions:secrets:set OPENAI_API_KEY
   ```
   ```bash
   firebase functions:secrets:set RC_WEBHOOK_AUTHORIZATION
   ```
   `RC_WEBHOOK_AUTHORIZATION` = valoarea exactă a headerului Authorization din RevenueCat (ex. `Bearer abc123`).
6. Instalezi dependențele și faci deploy (la primul deploy ți se cere `EMAIL_FROM`, ex. `Ago Log <no-reply@gengraphic.de>`):
   ```bash
   cd firebase/functions && npm install && cd ../..
   ```
   ```bash
   firebase deploy --only functions,firestore,storage
   ```
7. **RevenueCat** → Integrations → Webhooks: URL-ul funcției `revenuecatWebhook`
   (`https://europe-west1-ago-log.cloudfunctions.net/revenuecatWebhook`) și headerul Authorization de la pasul 5.
8. **Push Android:** cheia FCM V1 trebuie încărcată în EAS:
   ```bash
   eas credentials
   ```

## Dezvoltare locală (emulator)

Creezi `firebase/functions/.env.local` cu `EMAIL_FROM=test` și `firebase/functions/.secret.local` cu
`RESEND_API_KEY=x`, `OPENAI_API_KEY=...` și `RC_WEBHOOK_AUTHORIZATION=Bearer test`. Ambele fișiere sunt în `.gitignore`. Apoi pornești emulatorul:

```bash
firebase emulators:start --project demo-ago-log --only auth,firestore,functions,storage
```

În emulator, `sendOtp` nu trimite email: codul apare în log (`[emulator] OTP for ...`).

## Diferențe față de Appwrite

- Toate interogările pe `entries`, `assets` și `notifications` includ `userId == uid`, pentru că Firestore respinge interogările nefiltrate.
- Datele (`expiryDate`, `lastServiceDate`, `sentAt`, `createdAt`) sunt stocate ca string ISO, deci comparațiile din interogări merg.
- `assets.entries` e o listă de ID-uri (`string[]`). `getAsset` încarcă intrările complete.
- Pozele sunt la `users/{uid}/entries/{fileId}.jpg`, iar `entry.imageId` = `fileId`.
- `plan` se scrie doar din webhook-ul RevenueCat. `CANCELLATION` nu mai retrogradează contul: userul păstrează accesul până la `EXPIRATION`.
- Valorile pentru plan sunt `PRO` / `FREE`, la fel ca enum-ul din aplicație. Funcțiile vechi scriau greșit `Pro` / `Free`.
