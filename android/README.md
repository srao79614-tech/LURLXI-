# LURL Android Studio Project

This is the complete, integrated Android Studio project for the **LURL Executive Platform**.
It runs the exact same UI layouts, styles, 3D animations, Trading Codex, AI Chatbot, VIP portal, and real-time Share Thoughts system as shown in the preview, wrapped seamlessly in a high-performance, hardware-accelerated Android environment using `androidx.webkit.WebViewAssetLoader`.

## Project Structure
```text
android/
├── app/
│   ├── build.gradle                   # App build configuration (minSdk 24, targetSdk 34)
│   └── src/
│       └── main/
│           ├── AndroidManifest.xml    # Permissions (Internet, Audio/Mic) and Launcher
│           ├── assets/                # Full built production web assets (HTML/CSS/JS)
│           │   ├── index.html
│           │   └── assets/
│           ├── java/com/lurl/app/
│           │   └── MainActivity.kt    # Full WebView integration with microphone & file chooser
│           └── res/                   # Luxury dark & gold themes, colors, and layout
├── build.gradle                       # Top-level Gradle script
├── gradle.properties                  # AndroidX & JVM memory settings
└── settings.gradle                    # Project module settings
```

## How to Open and Run in Android Studio

1. **Prerequisites**:
   - Ensure the web assets are built by running:
     ```bash
     npm run build:android
     ```
     This compiles the latest React/TypeScript/Tailwind app and synchronizes it directly to `android/app/src/main/assets/`.

2. **Open in Android Studio**:
   - Launch **Android Studio**.
   - Select **File** > **Open...**
   - Browse to this project's directory and select the `android` folder.
   - Click **OK**.

3. **Gradle Sync**:
   - Android Studio will automatically sync the Gradle files.
   - Wait for dependencies to finish syncing (`androidx.webkit`, `androidx.swiperefreshlayout`, etc.).

4. **Run on Device or Emulator**:
   - Connect an Android device with USB debugging enabled OR start an Android Emulator (API 24+).
   - Click the green **Run (▶)** button in the top toolbar or press `Shift + F10`.
   - The app will launch with the exact preview UI, styling, dark luxury theme, and fluid responsiveness!

5. **Generate Release APK / AAB**:
   - Go to **Build** > **Generate Signed Bundle / APK...**
   - Choose **Android App Bundle** (for Google Play Store) or **APK** (for direct installation).
   - Follow prompts to sign and generate your production release file.
