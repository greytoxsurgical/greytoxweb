# GreyTox Surgical Instruments — Website

Plain HTML/CSS/JS website (no build step) + Firebase (Firestore + Storage) backend,
ready to deploy on Vercel as a static site. Everything editable from the built-in
Admin Panel — no code changes needed after setup.

---

## 1) Create your Firebase project (one-time, ~5 minutes)

1. Go to **console.firebase.google.com** → **Add project** → name it `greytox` (or anything) → finish the wizard.
2. In the left sidebar: **Build → Firestore Database → Create database** → choose **Production mode** → pick a region close to Pakistan (e.g. `asia-south1`) → Enable.
3. In the left sidebar: **Build → Storage → Get started** → Production mode → same region → Done.
4. Click the **gear icon → Project settings → General**, scroll to "Your apps", click the **`</>` (Web)** icon, register the app (nickname: `greytox-web`, do NOT tick Firebase Hosting). Firebase will show a `firebaseConfig` object.
5. Copy those 6 values into **`js/firebase-config.js`** in this project, replacing the `PASTE_...` placeholders.

### Firestore Security Rules
Go to **Firestore Database → Rules** and paste:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read: if true;
      allow write: if true; // admin panel is password-gated in the UI itself
    }
  }
}
```
### Storage Security Rules
Go to **Storage → Rules** and paste:
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if true;
    }
  }
}
```
> Note: the admin panel is protected by the password screen in the browser (default
> `22332021`, change it in `js/firebase-config.js`). The rules above keep the
> database open at the network level since this is a static site with no server —
> that's normal for small catalog sites like this. If you ever want stronger
> protection, ask a developer to add Firebase Authentication + rules that check
> `request.auth`.

---

## 2) Connect the Contact Us / Make a Deal forms to your email

1. Go to **web3forms.com** → enter `greytoxsurgical@gmail.com` → get your free **Access Key** (no signup needed, key is emailed to you).
2. Paste it into `js/firebase-config.js` → `WEB3FORMS_ACCESS_KEY`.
3. Both `sales@greytox.com` and `greytoxsurgical@gmail.com` are already set in `NOTIFY_EMAILS` — every Contact Us and Make a Deal submission emails both, **and** is saved inside the Admin Panel (Messages / Deal Inquiries tabs) as a backup.

---

## 3) Deploy to Vercel

1. Push this whole folder to a GitHub repo (or drag-and-drop the folder at vercel.com/new — Vercel supports static folder deploys directly).
2. On vercel.com → **Add New → Project** → import the repo.
3. Framework preset: **Other** (it's plain static HTML — no build command, no output directory needed, `index.html` is already at the root).
4. Deploy. Your site goes live at `yourproject.vercel.app` — add a custom domain later from Project → Settings → Domains.

---

## 4) Using the Admin Panel

- On any page, scroll to the **footer** and click the GreyTox logo **5 times quickly** → a password box appears.
- Password: **`22332021`** (change anytime in `js/firebase-config.js` → `ADMIN_PASSWORD`, or ask a developer to move it server-side later).
- From the dashboard you can manage: **Products** (multi-image upload, auto-cropped to 1080×1080, rich-text description with bold/italic/color/bullets/tables, category, price, student-offer toggle), **Categories**, **Certificates** (A4 upload, shown blurred on the public page), **Catalogs** (PDF upload/reupload), **About Us** (image + rich text), **Feedbacks**, **Previous Orders**, **Deal Inquiries**, **Contact Messages**, **Site Settings** (address/phone/WhatsApp/emails/social links), and **Theme Colors**.

---

## 5) First-time content

Open the Admin Panel once and click **Seed Starter Data** on the dashboard — this adds the starter categories (Ortho, Dental, Veterinary, General Surgery, Beauty & Cosmetic, Diagnostic), 4 sample student-offer products, and 4 sample feedbacks, all of which you can edit or delete afterward.

---

## 6) Folder structure
```
index.html, products.html, product.html, certificates.html, about.html,
contact.html, student-offers.html, make-a-deal.html, catalogs.html,
previous-orders.html, admin.html
css/style.css       → design system (colors, type, components)
css/admin.css       → admin dashboard styles
js/firebase-config.js → YOUR keys go here
js/utils.js         → image resize/crop, WhatsApp links, Web3Forms, admin auth
js/components.js    → shared header/footer/top-slider (renders on every page)
js/main.js, products.js, product-detail.js, deal.js → page logic
js/admin.js         → the entire admin dashboard
assets/logo/logo.png → your logo (used everywhere incl. favicon)
assets/icons/        → official Facebook/Instagram/WhatsApp/TikTok/LinkedIn marks
```
