# TOMÉA PERFUMES — Official E-Commerce & Brand Showcase

> **"Confidence, Bottled."**  
> A luxury Extrait de Parfum brand celebrating African opulence, timeless sophistication, and magnetic allure.

---

## 1. Project Structure

```
tomea-perfumes/
├── index.html                   # Cinematic homepage with hero, editorial intro, and featured products
├── collection.html              # Full boutique collection catalogue with filters and search
├── product.html                 # Dynamic product detail page (olfactory pyramid, gallery, WhatsApp order)
├── about.html                   # Maison story, craftsmanship, philosophy, and brand guidelines
├── contact.html                 # Private client concierge, touchpoints, FAQ, and WhatsApp direct chat
├── privacy.html                 # Client discretion, ordering policy, white-glove dispatch, and returns
│
├── admin/                       # Protected Maison Administration & CMS Portal
│   ├── login.html               # Admin authentication screen (Firebase Auth + instant demo session)
│   ├── dashboard.html           # Metrics overview, recent products, and live concierge routing status
│   ├── products.html            # Full CRUD management, olfactory notes builder, and image uploader
│   ├── homepage.html            # Homepage CMS (hero banner, editorial copy, vision & mission)
│   └── settings.html            # WhatsApp concierge phone configuration, brand defaults, Cloudinary CDN
│
├── css/
│   ├── style.css                # Luxury design system, brand colors, typography, and boutique UI
│   ├── responsive.css           # Mobile-first responsiveness, fluid breakpoints, and touch drawers
│   ├── admin.css                # Modern luxury administrative interface styling
│   └── animations.css           # Smooth reveals, transitions, and luxury micro-interactions
│
├── js/
│   ├── firebase-config.js       # Centralized Firebase & Cloudinary runtime credentials
│   ├── firebase-auth.js         # Admin route protection & session management
│   ├── firestore.js             # Unified database layer (Firestore live sync + offline seed fallback)
│   ├── cloudinary.js            # Unsigned direct image uploads to Cloudinary CDN
│   ├── whatsapp.js              # Intelligent WhatsApp ordering engine with dynamic text templating
│   ├── products.js              # Boutique collection rendering, filtering, and sorting
│   ├── product-details.js       # Individual fragrance presentation, gallery, and olfactory pyramid
│   ├── homepage.js              # Homepage dynamic controller and featured fragrance hydration
│   ├── navigation.js            # Glassmorphism sticky header, active states, and mobile drawer
│   ├── animations.js            # IntersectionObserver scroll reveals and toast notification manager
│   ├── admin.js                 # Admin dashboard metrics and session handler
│   ├── admin-products.js        # Admin fragrance CRUD controller and notes tags builder
│   ├── admin-homepage.js        # Admin homepage editorial CMS controller
│   ├── admin-settings.js        # Admin WhatsApp phone and configuration manager
│   └── utils.js                 # Currency formatting, XSS escaping, slug generation, and alerts
│
├── assets/
│   ├── images/                  # Flacon photography, lifestyle campaigns, brand logos, packaging
│   └── icons/                   # Custom UI icons
│
├── firestore.rules              # Granular security rules for Cloud Firestore
└── README.md                    # Complete setup, deployment, and operational documentation
```

---

## 2. Setup Instructions

The application is built using pure **HTML5, CSS3, Vanilla JavaScript, Firebase, and Cloudinary** — requiring no heavy build toolchains or npm compilation to run.

### Running Locally
You can view and test the website using any standard web server:

```bash
# Option A: Using Python 3 (if installed)
cd tomea-perfumes
python -m http.server 8000

# Option B: Using Node.js (npx serve or http-server)
cd tomea-perfumes
npx serve .

# Option C: Using VS Code / Antigravity Live Server
Right-click "index.html" -> Open with Live Server
```

Once running, navigate to `http://localhost:8000` in your web browser.

---

## 3. Firebase Setup Instructions

1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Click **Create a project** and name it (e.g. `tomea-perfumes`).
3. Under **Project Overview**, click the **Web icon `</>`** to register a web app.
4. Name the web app `tomea-web` and register it.
5. Copy the `firebaseConfig` object provided by Firebase.
6. Open `js/firebase-config.js` and paste your project values:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "tomea-perfumes.firebaseapp.com",
  projectId: "tomea-perfumes",
  storageBucket: "tomea-perfumes.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef..."
};
```

---

## 4. Firestore Setup

1. In your Firebase Console, navigate to **Build** > **Firestore Database**.
2. Click **Create database**.
3. Choose your database location (e.g. `eur3` Europe-West or `us-central`).
4. Select **Start in production mode** (we will apply security rules next).
5. Firestore collections will automatically seed upon first admin initialization:
   - `products`: Fragrance catalog, pricing, olfactory notes, and stock status.
   - `settings`: Global configuration, WhatsApp concierge number, and contact details.
   - `homepage`: Hero statements, mission, vision, and editorial quotes.
   - `admins`: Authorized admin user UIDs.

---

## 5. Firebase Security Rules

Deploy the included `firestore.rules` file via the Firebase CLI or copy and paste it into the Firebase Console (**Firestore Database** > **Rules** tab):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Check if user is an authenticated administrator
    function isAdmin() {
      return request.auth != null && 
        (exists(/databases/$(database)/documents/admins/$(request.auth.uid)) ||
         request.auth.token.admin == true);
    }
    
    // Products Collection: Public can view active products; only admins can write
    match /products/{productId} {
      allow read: if resource.data.isActive == true || isAdmin();
      allow write: if isAdmin();
    }
    
    // Settings: Public can read settings; only admins can write
    match /settings/{settingId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // Homepage Content: Public can read; only admins can write
    match /homepage/{contentId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // Admins Collection: Protected to admins only
    match /admins/{adminId} {
      allow read, write: if isAdmin();
    }
  }
}
```

---

## 6. Firebase Authentication Setup

1. In Firebase Console, go to **Build** > **Authentication**.
2. Click **Get Started**.
3. In the **Sign-in method** tab, click **Email/Password**.
4. Enable **Email/Password** and click **Save**.

---

## 7. Cloudinary Setup

1. Sign up for a free account at [Cloudinary](https://cloudinary.com/).
2. On your Cloudinary Dashboard, locate your **Cloud Name** (e.g. `tomea-luxury`).
3. Go to **Settings (Gear Icon)** > **Upload**.
4. Scroll down to **Upload presets** and click **Add upload preset**.
5. Set:
   - **Upload preset name**: `tomea_unsigned`
   - **Signing Mode**: `Unsigned`
   - **Folder**: `tomea_perfumes`
6. Click **Save**.
7. In `js/firebase-config.js` or via **Admin Settings** (`admin/settings.html`), input your Cloud Name and Upload Preset.

---

## 8. Required Environment & Configuration Values

All settings can be configured either directly in `js/firebase-config.js` or updated via the Admin Portal (`admin/settings.html`):

| Parameter | Default Value | Description |
|---|---|---|
| `brandName` | `TOMÉA PERFUMES` | Official Brand Display Name |
| `tagline` | `Confidence, Bottled.` | Official Brand Tagline |
| `defaultWhatsApp` | `2348000000000` | International WhatsApp number without `+` |
| `defaultCurrency` | `₦` | Currency symbol |
| `defaultCurrencyCode` | `NGN` | ISO Currency code |
| `contactEmail` | `concierge@tomeaperfumes.com` | Official concierge email |
| `cloudinary.cloudName` | `YOUR_CLOUD_NAME` | Cloudinary Cloud Name |
| `cloudinary.uploadPreset` | `YOUR_PRESET` | Cloudinary Unsigned Preset |

---

## 9. How to Create the First Admin

### Method A: Instant Local Demo (Works Immediately Out of the Box)
The portal comes equipped with built-in administrator demo authentication for immediate local evaluation:
- **URL:** `http://localhost:8000/admin/login.html`
- **Email:** `admin@tomeaperfumes.com`
- **Password:** `TomeaLuxury2026!`

### Method B: In Firebase Console
1. Navigate to **Authentication** > **Users** in your Firebase Console.
2. Click **Add user**.
3. Enter your administrator email and a strong password.
4. Copy the newly generated **User UID**.
5. Navigate to **Firestore Database** > **Start collection**.
6. Collection ID: `admins`.
7. Document ID: Paste the administrator's **User UID**.
8. Add field: `email` (string) = `your-admin@tomeaperfumes.com`, `role` (string) = `superadmin`.
9. The user is now an authorized Firebase administrator and can sign in via `admin/login.html`.

---

## 10. How to Add and Manage Products

1. Log in to the Admin Portal at `admin/login.html`.
2. Navigate to **Fragrances** (`admin/products.html`).
3. Click the **+ Add New Fragrance** button in the top right.
4. Fill in:
   - **Fragrance Title** (e.g. `TOMÉA L'Origine`)
   - **Editorial Subtitle** (e.g. `Power, Depth, Quiet Confidence`)
   - **Concentration** (e.g. `Extrait de Parfum`)
   - **Price** (in Nigerian Naira ₦) & Compare-at Price
   - **Olfactory Architecture**: Add individual **Top Notes**, **Heart Notes**, and **Base Notes**.
   - **Images**: Drag & drop your bottle imagery directly to upload via Cloudinary, or choose from the built-in TOMÉA Brand Asset Vault.
   - **Status**: Toggle **Active**, **Featured on Homepage**, or **Waitlist Only**.
5. Click **Save Fragrance**. Changes reflect instantly in both the collection catalogue and individual product detail pages.

---

## 11. How to Update Homepage Content

1. Log in to the Admin Portal and navigate to **Homepage CMS** (`admin/homepage.html`).
2. Adjust:
   - **Cinematic Hero**: Update the hero headline, editorial subtext, and call-to-action buttons.
   - **Editorial Brand Statement**: Update the introductory world narrative and quotes.
   - **Vision & Mission**: Modify the maison vision and mission statements.
   - **Hero Background**: Upload new campaign photography to Cloudinary or specify an asset path.
3. Click **Save & Publish Changes**.

---

## 12. How to Change the WhatsApp Ordering Number

All WhatsApp ordering triggers dynamically pull the phone number from the database and configuration:

1. Log in to the Admin Portal and click **Brand Settings** (`admin/settings.html`).
2. In the **WhatsApp Concierge Ordering Number** field, enter your international telephone number without the `+` sign (e.g. `2348123456789`).
3. Click **Save Settings**.
4. Every "Order via WhatsApp", "Chat with Concierge", and flacon checkout button across the entire boutique will immediately route new customer inquiries to the updated number.

---

## 13. How to Deploy the Website

Because this is a pure HTML/CSS/JS application, it can be deployed in seconds to any static hosting provider.

### Option 1: Firebase Hosting (Recommended)
```bash
# 1. Install Firebase CLI globally (if not installed)
npm install -g firebase-tools

# 2. Login to Firebase
firebase login

# 3. Initialize Firebase in the tomea-perfumes directory
firebase init

# Select:
# - Hosting: Configure files for Firebase Hosting
# - Use an existing project -> Select your tomea-perfumes project
# - What do you want to use as your public directory? -> . (current directory)
# - Configure as a single-page app? -> No
# - Set up automatic builds with GitHub? -> No

# 4. Deploy live
firebase deploy
```

### Option 2: Netlify
1. Drag and drop the `tomea-perfumes` folder directly into [Netlify Drop](https://app.netlify.com/drop).
2. Your website is instantly live with free SSL and custom domain support.

### Option 3: Vercel
```bash
npx vercel
```
Follow the interactive CLI prompts to deploy in under 60 seconds.

---

## Brand Guideline Compliance Summary

- **Visual Direction:** Follows the TOMÉA Brand Guideline document strictly — featuring deep burgundy, soft blush, cream/off-white, subtle gold accents, and high-fashion editorial serif typography (`Playfair Display`, `Cormorant Garamond`, `Poppins`).
- **Olfactory Architecture:** Features the authentic Extrait de Parfum creations (`L'Origine`, `Charme`, and `Désir`) with complete top, heart, and base note pyramids.
- **Conversion Flow:** Luxury editorial presentation transitioning smoothly into personalized WhatsApp concierge ordering with automated pre-filled product inquiries.
