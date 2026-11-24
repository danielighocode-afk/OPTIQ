# Optiq

A study and quiz app for Uniben Optometry students. Frontend only, built with React, Vite and TypeScript. Progress is saved in the browser (localStorage).

## Run it

```
npm install
npm run dev
```

Build for hosting with `npm run build`. The output goes to the `dist` folder, and you can upload that to any static host.

## Add quizzes

Open `src/data/quizzes.ts`, copy one of the sample quizzes, and change it. `courseCode` must match a course code exactly (for example `MTH 101`), and `answer` is the position of the correct option, counting from 0.

## Add or fix courses

Open `src/data/courses.ts`. The 100 level list is there, and 200 to 600 level are empty and ready to fill in the same format.

- Courses tagged `verified: true` were found on the official Uniben portal.
- Courses tagged `verified: false` came from your own list and show a "To confirm" badge. Once you confirm one, change it to `official(...)` and give it the right title.

Sets (OPT 190 to OPT 300) are generated at the top of the same file.

## Logo

The logo is at `public/resources/logo.png`. Replace the file to change it.

## Screens and flow

Splash, sign up (or sign in), email check, three intro slides, then level and set, then the app. The profile page is the last tab.

- Sign up, sign in, the email check and the Google, Apple and email buttons are mock-ups. Nothing is sent, and no password is stored. The account (name, email, phone, photo) is saved in the browser only.
- Sign in only works with the email used to sign up on the same device.
- Dark mode is in Profile, and also on the sign up and sign in pages. Animations switch off for people who have reduced motion turned on.

## Android APK (debug)

A GitHub Actions workflow (`.github/workflows/android-apk.yml`) builds a debug APK with Capacitor on every push to `main`, or by hand from the Actions tab (Run workflow). Open the finished run and download `optiq-debug-apk` under Artifacts. Unzip it, copy `app-debug.apk` to a phone and install it (Android asks you to allow installs from your browser or file manager).

The `android/` folder is generated during the build and is not committed. App ID: `com.optiq.app`. App name: OPTIQ. Icon and splash come from the pictures in `assets/`.
