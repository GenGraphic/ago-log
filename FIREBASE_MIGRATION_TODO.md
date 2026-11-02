# Migrare Appwrite → Firebase (TODO)

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
- [ ] Alege varianta: Blaze cu buget, sau Spark + servicii externe
- [ ] Creează proiectul Firebase. Există deja `ago-log` în `google-services.json`, poate fi refolosit.
- [ ] Adaugă aplicațiile iOS (`com.gengraphic.agolog`) și Android, apoi descarcă `GoogleService-Info.plist` și `google-services.json`
- [ ] Alege SDK-ul:
  - `firebase` (JS SDK): mai simplu, merge în Expo; auth persistat cu `getReactNativePersistence(AsyncStorage)`
  - `@react-native-firebase/*`: nativ, cere dev build (ai deja `expo-dev-client`)

### 1. Autentificare (`hooks/useAuth.ts`, `hooks/useUser.ts`, ecranele din `app/(auth)`)
- [ ] Decide fluxul de login care înlocuiește OTP-ul pe email:
  - email link (magic link): gratuit, dar cere deep link (`agolog://`) și Firebase Dynamic Links nu mai există, deci trebuie configurat cu domeniul Hosting
  - email + parolă: cel mai simplu
  - OTP custom: funcție proprie care trimite codul și emite custom token. Cere server și furnizor de email.
- [ ] Rescrie `createEmailToken` / `createSession` / `deleteSession` / `auth.get` / `updateStatus`
- [ ] MFA: amână-l sau acceptă upgrade-ul la Identity Platform
- [ ] Adaugă un listener `onAuthStateChanged` în locul `checkUserPresence`
- [ ] Migrarea userilor existenți: export din Appwrite, apoi `firebase auth:import`. Alternativ, userii se reînregistrează. Păstrează ID-urile, pentru că sunt folosite ca `userId` în date.

### 2. Bază de date: Firestore
- [ ] Mapează tabelele în colecții: `users/{uid}`, `entries`, `notifications`, `assets` (ID-urile de tabele din `appwrite.ts` dispar)
- [ ] Scrie `firestore.rules`, echivalentul permisiunilor `read/update("user:ID")`: userul își citește și scrie doar documentele lui
- [ ] Creează indexuri compuse pentru interogările folosite:
  - `notifications`: `userId ==` + `orderBy sentAt desc`
  - `entries`: `status ==` + `expiryDate != null` (pentru cron)
  - restul interogărilor din `hooks/useEntries.ts`, `hooks/useAssets.ts` (`equal`, `greaterThan`, `lessThanEqual`, `orderAsc/Desc`, `select`)
- [ ] Rescrie hook-urile (~25 apeluri):
  - [ ] `hooks/useUser.ts`
  - [ ] `hooks/useEntries.ts`
  - [ ] `hooks/useAssets.ts`
  - [ ] `hooks/useNotifications.ts`
  - [ ] `hooks/usePushToken.ts`
  - [ ] `hooks/useRevenueCat.ts`
  - [ ] `components/profile/NotificationsSection.tsx`
- [ ] Adaptează mapper-ele din `helpers/userHelper.ts` (`$id`, `$createdAt` devin `doc.id` și câmpuri proprii; datele devin `Timestamp`)
- [ ] `query.select(...)` nu are echivalent pe client în Firestore: se citește tot documentul
- [ ] Script de migrare a datelor: export din Appwrite, import în Firestore cu Admin SDK

### 3. Stocare poze (`hooks/useStorage.ts`)
- [ ] Blaze: Cloud Storage + `storage.rules` (doar proprietarul)
- [ ] Spark: Cloudflare R2 sau alt serviciu, cu upload prin URL semnat generat de un worker
- [ ] Înlocuiește `getFilePreviewURL`. Firebase nu face redimensionare automată: extensia „Resize Images” (Blaze) sau redimensionezi pe client cu `expo-image-manipulator`.
- [ ] Migrează fișierele din bucket-ul `ENTRIES_IMAGES_BUCKET_ID` și actualizează `imageId` în entries

### 4. Funcții backend (`functions/*`, ~660 linii)
- [ ] `send-notifications` (cron 04:00 UTC): `onSchedule` în Cloud Functions v2 (Blaze), sau Cloudflare Worker cron cu Firebase Admin
- [ ] `handleEntryImage` (OpenAI): funcție `onCall`, iar cheia OpenAI trece în Secret Manager sau în secretele worker-ului. Actualizează `hooks/useAI.ts` (`functions.createExecution` devine `httpsCallable`).
- [ ] `on-success-payment`, `on-fail-payment` (webhook RevenueCat): funcții `onRequest`, apoi schimbi URL-ul webhook-ului în dashboard-ul RevenueCat
- [ ] Mută variabilele de mediu și secretele (`RC_WEBHOOK_AUTHORIZATION`, cheia OpenAI)
- [ ] Rescrie apelurile `node-appwrite` cu `firebase-admin`

### 5. Notificări push
- [ ] Poți păstra Expo Push (nu depinde de backend), sau poți trece pe FCM direct
- [ ] Android: cheia FCM V1 tot trebuie în EAS (`eas credentials`)

### 6. Config și curățenie
- [ ] `app.json`: plugin `@react-native-firebase/app` (dacă alegi nativ) și `ios.googleServicesFile`
- [ ] Șterge `appwrite.ts`, `appwrite.json` și dependențele `react-native-appwrite` / `node-appwrite`
- [ ] Actualizează `isGuestScopeError` și mesajele de eroare specifice Appwrite

### 7. Testare și lansare
- [ ] Testează cu Firebase Emulator Suite (Auth, Firestore, Functions)
- [ ] Testează pe dispozitiv fizic: login, CRUD entries/assets, upload poze, AI prefill, push, plată RevenueCat
- [ ] Plan de tranziție: build nou în store, iar vechiul backend rămâne pornit până se actualizează majoritatea userilor (versiunile vechi încă vorbesc cu Appwrite)
- [ ] Migrare finală a datelor (delta) și oprirea serverului Appwrite
