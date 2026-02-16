# Deploy Firestore Security Rules

The Firestore security rules need to be deployed to Firebase to fix permission errors.

## Prerequisites
- Firebase CLI installed
- Logged into Firebase account

## Steps

### 1. Install Firebase CLI (if not installed)
```bash
npm install -g firebase-tools
```

### 2. Login to Firebase
```bash
firebase login
```

### 3. Initialize Firebase in the project
```bash
cd "F:\Zerox eSports\zerox-esports-app"
firebase init
```

Select:
- **Firestore** (use existing rules file)
- Use existing project: **zerox-esports**

### 4. Deploy Firestore Rules
```bash
firebase deploy --only firestore:rules
```

## Alternative: Manual Deployment via Firebase Console

1. Go to: https://console.firebase.google.com/project/zerox-esports/firestore/rules
2. Copy contents from `firestore.rules` file
3. Paste into the rules editor
4. Click **Publish**

## After Deployment

The permission errors will be resolved and system settings will initialize automatically.
