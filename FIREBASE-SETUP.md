# Turning on accounts (Firebase)

1. **Create a project** at https://console.firebase.google.com (Add project).
2. **Add a web app**: Project settings → General → Your apps → `</>` Web. Copy the `firebaseConfig` values into `assets/firebase-config.js`.
3. **Turn on sign-in methods**: Build → Authentication → Get started → Sign-in method → enable **Email/Password** and **Google** (choose a support email).
4. **Allow your domains**: Authentication → Settings → Authorized domains → add `noneuncreator.com` (and `www.noneuncreator.com`, plus your `username.github.io` address if you test there).
5. **Create the database**: Build → Firestore Database → Create database (production mode, region `asia-northeast3` (Seoul) is a good choice).
6. **Set the security rules**: Firestore → Rules → paste the contents of `firestore.rules` → Publish.
7. **Optional, Korean emails**: Authentication → Templates → set the template language to Korean for verification and password reset emails.

Each member's data is stored in Firestore at `users/{uid}`: name, email, newsletter (true/false), completed lessons, last lesson viewed.
To see who opted in to email updates: Firestore → `users` collection → filter `newsletter == true`.
