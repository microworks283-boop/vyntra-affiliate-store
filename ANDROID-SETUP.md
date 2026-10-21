# VYNTRA Android + Google Play release guide

This project uses Capacitor to package the React/Vite storefront as an Android app. The ZIP contains the web source and Capacitor configuration; generate the native Android project locally with the commands below.

## Before you build

1. Deploy the Express API to a public HTTPS host. The API must persist users in a database for production (the current JSON user file and in-memory OTP/session storage are demo-only). Configure Gmail SMTP secrets on the host, not in the mobile app.
2. Copy `client/.env.production.example` to `client/.env.production` and set `VITE_API_BASE_URL` to the public HTTPS API origin, with no trailing slash. Example: `VITE_API_BASE_URL=https://api.example.com`. Do not build with a blank API URL for production, because email OTP and live product API calls need the backend.
3. Update privacy policy, support contact, affiliate disclosures and retailer affiliate URLs. Ensure your affiliate programmes permit promotion inside a mobile app.

## Install Android tools

Install Android Studio and its Android SDK. Use the JDK bundled with Android Studio. Capacitor 8 requires a recent Android Studio; see the official environment setup guide: https://capacitorjs.com/docs/getting-started/environment-setup

## Generate and run the Android project (Windows CMD, project root)

```cmd
npm run install:all
npm run android:init
npm run android:sync
npm run android:open
```

`npm run android:init` is a one-time command. If an `android` native project already exists, skip it and run `npm run android:sync`. Android Studio opens the native project. Wait for Gradle sync, select an emulator or connect an Android phone with USB debugging, then press Run to test.

After changing frontend code or `client/.env.production`, run `npm run android:sync` again.

## Create the Play Store bundle (.aab)

1. In Android Studio, select **Build > Generate Signed Bundle / APK**.
2. Select **Android App Bundle**.
3. Create a new upload keystore and save the keystore file and passwords somewhere secure and backed up. Never commit them to Git or send them in chat. Losing the key can complicate future releases.
4. Choose the release build variant and finish. Android Studio will create a signed `.aab` file, typically under `android/app/release/` or `android/app/build/outputs/bundle/release/`. Use the actual path shown by Android Studio.
5. Keep the same application ID (`com.vyntra.shop`) for future updates and increment `versionCode` for each release. Confirm the target API level required by Play Console at upload time.

## Publish in Google Play Console

1. Create a Google Play developer account and complete identity/account verification. A one-time registration fee may apply; check the current Play Console sign-up page for the current fee.
2. In Play Console, create an app named **VYNTRA**, select app/game and free/paid, complete declarations, and provide a support email.
3. Complete the store listing: short/full description, app icon, phone screenshots, feature graphic, privacy policy URL, data safety, content rating, target audience, ads declaration and app access instructions as applicable.
4. Upload the signed `.aab` to Internal testing first and install it from the testing link. Check login/signup email OTP, product browsing, external affiliate links, privacy disclosures, and app behavior on different screen sizes.
5. If your Play Console account is a **personal account created after 13 November 2023**, Google currently requires a closed test with at least 12 opted-in testers continuously for 14 days before you can apply for production access. Check the current Play Console dashboard/help page for your account's exact requirements.
6. Apply for production access if required, fix policy/pre-launch report issues, then create a Production release and roll it out. Google reviews submissions; publication is not automatic.

## Important launch blockers

- The existing server uses `server/users.json` and keeps OTP challenges/session tokens in memory. That is not production-grade authentication or durable user storage. Replace it with a proper database, persistent session/token handling, rate limiting, abuse protection, and HTTPS before accepting real customers.
- Never embed Gmail SMTP credentials or app passwords in the Android app. Keep them only in server-side environment variables.
- Ensure all product images, prices and affiliate tracking links are authorized and accurate. Clearly disclose affiliate commissions.
- The app ID and package name must remain stable after publishing.
