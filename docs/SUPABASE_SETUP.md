# Supabase setup for OPTIQ

Do these once. Until the two GitHub variables in step 5 are set, the app keeps running in local preview mode.

## 1. Create the project
1. Go to supabase.com, sign in, click **New project**.
2. Name it `optiq`, choose a strong database password (save it somewhere), pick the region closest to your students, and create it. Wait about two minutes.

## 2. Create the tables
1. In the project, open **SQL Editor** (left menu), click **New query**.
2. Open `supabase/migrations/20261124000000_init.sql` from this repo, copy everything, paste it in, click **Run**.
3. It should say "Success. No rows returned". You can run it again safely.

## 3. Sign-in settings
1. **Authentication > URL Configuration > Redirect URLs > Add URL**: add `com.optiq.app://login-callback` and save.
2. **Authentication > Sign In / Providers > Email**: keep **Confirm email** switched on.
3. Supabase's built-in email sender only allows a small number of emails per hour. Before real students sign up, connect your own sender under **Authentication > SMTP Settings** (for example Resend, which has a free plan).

## 4. Google sign-in
1. Go to console.cloud.google.com and create a project called `optiq`.
2. **APIs & Services > OAuth consent screen**: choose **External**, app name `OPTIQ`, your support email, save. While it says "Testing", only emails you add under **Test users** can sign in. When ready for everyone, click **Publish app**.
3. **APIs & Services > Credentials > Create credentials > OAuth client ID**, type **Web application**.
4. Under **Authorized redirect URIs** add: `https://YOUR-PROJECT-ID.supabase.co/auth/v1/callback` (your project ID is in the Supabase project URL).
5. Create it and copy the **Client ID** and **Client secret**.
6. In Supabase: **Authentication > Sign In / Providers > Google**, switch it on, paste both values, save. The secret only ever goes here, never into the app or GitHub.

## 5. Give the app its two public values
1. In Supabase: **Project Settings > API**. Copy the **Project URL** and the **anon / publishable key**. Never use the `service_role` / secret key.
2. In GitHub: your repo > **Settings > Secrets and variables > Actions > Variables** tab > **New repository variable**. Create:
   - `SUPABASE_URL` = the Project URL
   - `SUPABASE_ANON_KEY` = the anon / publishable key
3. Push any change (or use **Actions > Build Android debug APK > Run workflow**).

## 6. Install the new build
Each GitHub build is signed with a fresh debug key, so Android will not install it over an older build. **Uninstall the old OPTIQ app first**, then install the new APK.

## Local development (optional)
Copy `.env.example` to `.env.local`, fill in the two values, then `npm install` and `npm run dev`.

## What lives where
- `profiles`: name, phone, photo link, level and set, one row per student.
- `results`: best score, last score, attempts per student and quiz.
- Profile photos: the `avatars` storage bucket. Photos can be opened by anyone who has the link.
- Row-level security means a student can only read or change their own rows and files.
