# EasyMessage

A modern WhatsApp bulk messaging web app built with React, Firebase, and Tailwind CSS. Send personalised messages to multiple contacts using dynamic templates — without saving phone numbers.

---

## Features

- **Send personalised messages** — use variables like `{name}`, `{order_id}`, `{amount}` that get replaced per contact
- **Saved contacts** — add, edit, delete contacts with group assignment; import via CSV
- **Message templates** — create, save, and reuse templates with variable support
- **Groups** — organise contacts into segments like VIP, Leads, Customers
- **Search & filter** — find contacts by name, number, or group
- **Bulk send** — generate personalised WhatsApp links for all contacts at once
- **Firebase auth** — email/password sign in, persistent sessions
- **Firestore storage** — all data saved per user in the cloud
- **Dark mode** — smooth WhatsApp-style transition
- **PWA ready** — installable on mobile via manifest and service worker
- **Fully responsive** — sidebar layout on desktop, bottom tab bar on mobile

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS v4 |
| Auth | Firebase Authentication |
| Database | Firebase Firestore |
| PWA | vite-plugin-pwa |
| Hosting | Netlify |

---

## Project Structure

```
easymessage/
├── public/
│   ├── pwa-192x192.png
│   ├── pwa-512x512.png
│   └── apple-touch-icon.png
├── src/
│   ├── firebase.js           # Firebase app, auth, db init
│   ├── AuthContext.jsx        # Auth state, signup, login, logout
│   ├── AppContext.jsx         # Global state for contacts, groups, templates
│   ├── firestoreService.js    # All Firestore read/write functions
│   ├── ui.jsx                 # Shared UI primitives (Card, Button, Input…)
│   ├── App.jsx                # Main dashboard with sidebar layout
│   ├── AuthPage.jsx           # Login and signup page
│   ├── SendMessage.jsx        # Single message send flow
│   ├── ContactManager.jsx     # Contact list and form
│   ├── TemplateManager.jsx    # Template list and editor
│   ├── GroupManager.jsx       # Group management
│   ├── SearchFilter.jsx       # Search and filter contacts
│   ├── main.jsx               # Entry point, auth guard
│   └── index.css              # Global styles and dark mode transition
├── .env                       # Firebase config keys (not committed)
├── vite.config.js
└── package.json
```

---

## Getting Started

### Prerequisites

- Node.js v18 or higher
- A Firebase project (free Spark plan)

### 1. Clone the repo

```bash
git clone https://github.com/yourusername/easymessage.git
cd easymessage
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Firebase

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Create a new project
3. Enable **Authentication → Email/Password**
4. Create a **Firestore database** (start in test mode, region: `asia-south1`)
5. Go to **Project settings → Your apps → Web** and copy the config

### 4. Configure environment variables

Create a `.env` file in the project root:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 5. Run the dev server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Building for Production

```bash
npm run build
```

This generates a `dist/` folder ready to deploy.

---

## Deployment (Netlify)

1. Run `npm run build`
2. Go to [netlify.com](https://netlify.com) and log in
3. Drag and drop the `dist/` folder onto the Netlify dashboard
4. Your app is live at a `*.netlify.app` URL

To redeploy after changes, run `npm run build` again and drag the new `dist/` folder.

---

## CSV Import Format

Contacts can be imported via CSV. The first row must be headers. Columns beyond `name` and `number` are automatically mapped to template variables.

```csv
name,number,order_id,amount
Rahul,9876543210,ORD001,499
Priya,9123456780,ORD002,999
```

---

## Firestore Data Structure

```
users/
  {userId}/
    contacts/
      {contactId}: { name, number, group, order_id, amount, createdAt }
    templates/
      {templateId}: { text, createdAt }
    groups/
      {groupId}: { name, createdAt }
```

---

## How WhatsApp Sending Works

EasyMessage generates a `wa.me` deep link for each contact:

```
https://wa.me/<number>?text=<encoded_message>
```

Variables in the template are replaced with the contact's data before encoding. Clicking the link opens WhatsApp with the message pre-filled — **you must press send manually** inside WhatsApp. This is intentional and compliant with WhatsApp's terms of service.

---

## Limitations

- Messages cannot be sent automatically — WhatsApp blocks programmatic sending to prevent spam
- Requires manual send per contact in the WhatsApp app
- For large-scale automated sending, consider the official [WhatsApp Business API](https://developers.facebook.com/docs/whatsapp)

---

## License

MIT — free to use, modify, and distribute.

---

## Author

Built by [Pratibha Swami](https://github.com/pratibhaxs)
