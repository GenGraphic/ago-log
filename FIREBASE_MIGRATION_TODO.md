# Migrare Appwrite → Firebase (TODO)

> **Status:** codul e migrat (aplicație + backend în `firebase/`), testat în emulator.
> Decizii: plan **Blaze** + alertă de buget · login cu **OTP custom** (Resend) · **fără migrare de date** (pornim de la zero).
> Pașii de setup din consolă sunt în [`firebase/README.md`](firebase/README.md).
>
> **Rămas de făcut (manual, de tine):**
> - [ ] Pașii 1–8 din `firebase/README.md` (Blaze, IAM, Resend, secrete, deploy, webhook RevenueCat, FCM în EAS)
> - [ ] Build nou (`eas build`) și test pe telefon: login OTP, adăugare intrare cu poză, AI, push, plată
> - [ ] După lansare: oprește serverul Appwrite și șterge `functions/` (Appwrite) + `appwrite.json`
> - [ ] MFA (`app/(main)/mfa-setup.tsx` e doar UI) — necesită Identity Platform, amânat

## Pe scurt

- **Dificultate:** medie spre mare. Estimare pentru un singur dezvoltator: **~2–3 săptămâni** (cod + testare + migrare date).
- **Problema principală:** planul gratuit Firebase (**Spark**) **nu acoperă** tot ce folosește aplicația acum:

| Ce folosește aplicația acum (Appwrite) | Echivalent Firebase | Merge pe Spark (free)? |
|---|---|---|
| Auth cu cod OTP pe email (`createEmailToken`) | Firebase Auth — doar *email link* (magic link) sau email+parolă; OTP de 6 cifre nu există nativ | ⚠️ Parțial (trebuie schimbat fluxul de login) |
| MFA (`app/(main)/mfa-setup.tsx`) | Identity Platform (upgrade) + SMS | ❌ Necesită billing |
| TablesDB (users, entries, notifications, assets) | Firestore | ✅ (1 GiB, 50k citiri/zi, 20k scrieri/zi) |
| Storage (poze entries) | Cloud Storage for Firebase | ❌ Din oct. 2024 bucket-urile noi cer planul Blaze |
| Funcții (`send-notifications` cron, `handleEntryImage` cu OpenAI, 2× webhook RevenueCat) | Cloud Functions | ❌ Necesită Blaze |
| Push prin Expo Push API | Expo Push (rămâne la fel) sau FCM | ✅ |

**Concluzie:** „Firebase free” 100% nu e posibil fără să muți funcțiile și pozele în altă parte. Variante realiste:

1. **Firebase Blaze + alertă de buget** (recomandat). Blaze are aceleași cote gratuite ca Spark, plus cote gratuite pentru Functions (2M apeluri/lună) și Storage (5 GB). La volumul actual, costul ar trebui să fie ~0 €. Trebuie un card adăugat, iar o alertă de buget (ex. 1 €) te protejează.
2. **Firebase Spark + servicii externe gratuite.** Firestore + Auth pe Firebase; funcțiile pe Cloudflare Workers (cron triggers gratuite) sau Vercel; pozele pe Cloudflare R2 (10 GB gratuit). Mai multe piese de întreținut.

> Verifică limitele și prețurile actuale pe firebase.google.com/pricing înainte de decizie. Planurile se schimbă des.

---

## TODO

### 0. Decizie și pregătire
- [x] Alege varianta: Blaze cu buget, sau Spark + servicii externe
- [ ] Creează proiectul Firebase. Există deja `ago-log` în `google-services.json`, poate fi refolosit.
- [ ] Adaugă aplicațiile iOS (`com.gengraphic.agolog`) și Android, apoi descarcă `GoogleService-Info.plist` și `google-services.json`
- [x] Alege SDK-ul:
  - `firebase` (JS SDK): mai simplu, merge în Expo; auth persistat cu `getReactNativePersistence(AsyncStorage)`
  - `@react-native-firebase/*`: nativ, cere dev build (ai deja `expo-dev-client`)

### 1. Autentificare (`hooks/useAuth.ts`, `hooks/useUser.ts`, ecranele din `app/(auth)`)
- [x] Decide fluxul de login care înlocuiește OTP-ul pe email:
  - email link (magic link): gratuit, dar cere deep link (`agolog://`) și Firebase Dynamic Links nu mai există, deci trebuie configurat cu domeniul Hosting
  - email + parolă: cel mai simplu
  - OTP custom: funcție proprie care trimite codul și emite custom token. Cere server și furnizor de email.
- [x] Rescrie `createEmailToken` / `createSession` / `deleteSession` / `auth.get` / `updateStatus`
- [ ] MFA: amână-l sau acceptă upgrade-ul la Identity Platform
- [x] Adaugă un listener `onAuthStateChanged` în locul `checkUserPresence`
- ~~Migrarea userilor existenți: export din Appwrite, apoi `firebase auth:import`. Alternativ, userii se reînregistrează. Păstrează ID-urile, pentru că sunt folosite ca `userId` în date.~~ — nu e nevoie, pornim de la zero

### 2. Bază de date: Firestore
- [x] Mapează tabelele în colecții: `users/{uid}`, `entries`, `notifications`, `assets` (ID-urile de tabele din `appwrite.ts` dispar)
- [x] Scrie `firestore.rules`, echivalentul permisiunilor `read/update("user:ID")`: userul își citește și scrie doar documentele lui
- [x] Creează indexuri compuse pentru interogările folosite:
  - `notifications`: `userId ==` + `orderBy sentAt desc`
  - `entries`: `status ==` + `expiryDate != null` (pentru cron)
  - restul interogărilor din `hooks/useEntries.ts`, `hooks/useAssets.ts` (`equal`, `greaterThan`, `lessThanEqual`, `orderAsc/Desc`, `select`)
- [x] Rescrie hook-urile (~25 apeluri):
  - [x] `hooks/useUser.ts`
  - [x] `hooks/useEntries.ts`
  - [x] `hooks/useAssets.ts`
  - [x] `hooks/useNotifications.ts`
  - [x] `hooks/usePushToken.ts`
  - [x] `hooks/useRevenueCat.ts`
  - [x] `components/profile/NotificationsSection.tsx`
- [x] Adaptează mapper-ele din `helpers/userHelper.ts` (`$id`, `$createdAt` devin `doc.id` și câmpuri proprii; datele devin `Timestamp`)
- [x] `query.select(...)` nu are echivalent pe client în Firestore: se citește tot documentul
- ~~Script de migrare a datelor: export din Appwrite, import în Firestore cu Admin SDK~~ — nu e nevoie, pornim de la zero

### 3. Stocare poze (`hooks/useStorage.ts`)
- [x] Blaze: Cloud Storage + `storage.rules` (doar proprietarul)
- [ ] Spark: Cloudflare R2 sau alt serviciu, cu upload prin URL semnat generat de un worker
- [x] Înlocuiește `getFilePreviewURL`. Firebase nu face redimensionare automată: extensia „Resize Images” (Blaze) sau redimensionezi pe client cu `expo-image-manipulator`.
- ~~Migrează fișierele din bucket-ul `ENTRIES_IMAGES_BUCKET_ID` și actualizează `imageId` în entries~~ — nu e nevoie, pornim de la zero

### 4. Funcții backend (`functions/*`, ~660 linii)
- [x] `send-notifications` (cron 04:00 UTC): `onSchedule` în Cloud Functions v2 (Blaze), sau Cloudflare Worker cron cu Firebase Admin
- [x] `handleEntryImage` (OpenAI): funcție `onCall`, iar cheia OpenAI trece în Secret Manager sau în secretele worker-ului. Actualizează `hooks/useAI.ts` (`functions.createExecution` devine `httpsCallable`).
- [x] `on-success-payment`, `on-fail-payment` (webhook RevenueCat): funcții `onRequest`, apoi schimbi URL-ul webhook-ului în dashboard-ul RevenueCat
- [ ] Mută variabilele de mediu și secretele (`RC_WEBHOOK_AUTHORIZATION`, cheia OpenAI)
- [x] Rescrie apelurile `node-appwrite` cu `firebase-admin`

### 5. Notificări push
- [x] Poți păstra Expo Push (nu depinde de backend), sau poți trece pe FCM direct
- [ ] Android: cheia FCM V1 tot trebuie în EAS (`eas credentials`)

### 6. Config și curățenie
- [ ] `app.json`: plugin `@react-native-firebase/app` (dacă alegi nativ) și `ios.googleServicesFile`
- [ ] Șterge `appwrite.ts`, `appwrite.json` și dependențele `react-native-appwrite` / `node-appwrite`
- [x] Actualizează `isGuestScopeError` și mesajele de eroare specifice Appwrite

### 7. Testare și lansare
- [x] Testează cu Firebase Emulator Suite (Auth, Firestore, Functions)
- [ ] Testează pe dispozitiv fizic: login, CRUD entries/assets, upload poze, AI prefill, push, plată RevenueCat
- [ ] Plan de tranziție: build nou în store, iar vechiul backend rămâne pornit până se actualizează majoritatea userilor (versiunile vechi încă vorbesc cu Appwrite)
- ~~Migrare finală a datelor (delta) și oprirea serverului Appwrite~~ — nu e nevoie, pornim de la zero
