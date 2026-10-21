# VYNTRA V2 — Email OTP Login & Signup

V2 adds responsive Login/Sign up screens, email one-time passcode delivery, OTP verification, 5-minute expiry, limited verification attempts, account creation, and a local sign-in session token. SMS/Twilio is not used.

## 1. Configure email delivery (Gmail SMTP)
1. Sign in to the Google account that will send VYNTRA emails.
2. Enable 2-Step Verification and create a Google App Password from Google Account security settings. Use the generated app password, not your normal Gmail password.
3. In the project folder, open `server` and copy `.env.example` to a new file named `.env`.
4. Fill in `SMTP_USER`, `SMTP_PASS`, and `FROM_EMAIL` with your sending Gmail address and app password. Keep `SMTP_HOST=smtp.gmail.com`, `SMTP_PORT=587`, and `SMTP_SECURE=false` for STARTTLS.
5. Never share or commit `.env`. The example file contains placeholders only.

## 2. Install and run
Open Command Prompt in the project root (the folder containing the root `package.json`):

```cmd
npm run install:all
npm run dev
```

Open `http://localhost:5173`. The API runs on port 4000. If you already installed dependencies, restart `npm run dev` after editing `server/.env`.

## 3. How auth works
- Select **Login / Sign up** in the header.
- New users choose **Create account**, enter name and email, then enter the emailed 6-digit code.
- Existing users choose Login and verify the code sent to their registered email.
- Codes expire after 5 minutes; up to 5 verification attempts are allowed per code.
- Users are stored in `server/users.json`; do not expose that file publicly in production.

## Important before public launch
This is a local starter implementation. In-memory OTP/session storage resets when the server restarts; user data is stored in a local JSON file and is not suitable for multi-instance production hosting. Before deploying for real customers, use a database, persistent session/token strategy, rate limiting, HTTPS, and abuse monitoring. Do not use the JSON user store as a production identity database.


## Android / Google Play
See `docs/ANDROID-SETUP.md` for Capacitor setup, backend HTTPS configuration, Android Studio build, signed AAB generation, testing, and Play Console publishing. Do not publish until the API is deployed securely and the demo JSON/in-memory authentication storage has been replaced with production storage.


## VYNTRA account authentication (updated)

- **Sign up:** enter name, email address and a password (minimum 8 characters). VYNTRA sends a 6-digit email verification code. The account is created only after the code is verified.
- **Log in:** use the registered email address and password. Login does not require an OTP.
- Passwords are hashed with bcryptjs before storage; plain-text passwords are not written to `server/users.json`.
- OTPs expire after 5 minutes and allow up to 5 verification attempts.

### Configure Gmail SMTP

Copy `server/.env.example` to `server/.env` and set `SMTP_USER`, `SMTP_PASS`, and `FROM_EMAIL`. For Gmail, use a Google App Password (requires 2-Step Verification), not your normal Gmail password. Keep `.env` private and never commit it. Restart the server after changing the settings. Check `http://localhost:4000/api/health`; `emailConfigured` should be `true`.

### VYNTRA's purpose

VYNTRA brings shopping discovery from participating platforms such as Amazon, Flipkart, Myntra, Meesho and AJIO into one place. Customers follow product links and complete purchases on the retailer's own website. Replace demo product links with your approved affiliate URLs before launch and clearly disclose affiliate relationships.

### Production warning

This starter currently stores users in a local JSON file and OTP challenges/sessions in server memory. Use a persistent database, durable and revocable sessions, HTTPS, rate limiting, and a deployed backend before public production use. Localhost URLs will not work from customer phones.
