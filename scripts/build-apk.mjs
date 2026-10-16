// Builds the static mobile web bundle, syncs it into the Android project, and
// assembles an installable APK at dist/PRESENT.apk.
//
//   npm run android:apk            debug APK (sideload / testing)
//
// Finds Java and the Android SDK from Android Studio's default install
// locations if JAVA_HOME / ANDROID_HOME aren't set.
import { execSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const win = process.platform === "win32";

function firstExisting(paths) {
  return paths.find((p) => p && existsSync(p));
}

const javaHome = firstExisting([
  process.env.JAVA_HOME,
  win && "C:\\Program Files\\Android\\Android Studio\\jbr",
  !win && "/Applications/Android Studio.app/Contents/jbr/Contents/Home",
  !win && "/opt/android-studio/jbr",
]);
const sdk = firstExisting([
  process.env.ANDROID_HOME,
  process.env.ANDROID_SDK_ROOT,
  win && join(process.env.LOCALAPPDATA ?? "", "Android", "Sdk"),
  !win && join(homedir(), "Library", "Android", "sdk"),
  !win && join(homedir(), "Android", "Sdk"),
]);

if (!javaHome) throw new Error("Java not found. Install Android Studio or set JAVA_HOME (JDK 21).");
if (!sdk) throw new Error("Android SDK not found. Install it via Android Studio or set ANDROID_HOME.");

const env = { ...process.env, JAVA_HOME: javaHome, ANDROID_HOME: sdk, ANDROID_SDK_ROOT: sdk };
const run = (cmd, cwd = root, extra = {}) => {
  console.log(`\n> ${cmd}`);
  execSync(cmd, { cwd, stdio: "inherit", env: { ...env, ...extra } });
};

run("npx next build", root, { BUILD_TARGET: "mobile" });
run("npx cap sync android");

// Gradle reads the SDK location from local.properties.
writeFileSync(join(root, "android", "local.properties"), `sdk.dir=${sdk.replace(/\\/g, "\\\\")}\n`);

const androidDir = join(root, "android");
// Full path: some shells don't search the current directory for executables.
run(`"${join(androidDir, win ? "gradlew.bat" : "gradlew")}" assembleDebug`, androidDir);

const apk = join(root, "android", "app", "build", "outputs", "apk", "debug", "app-debug.apk");
mkdirSync(join(root, "dist"), { recursive: true });
const out = join(root, "dist", "PRESENT.apk");
copyFileSync(apk, out);
console.log(`\n✅ APK ready: ${out}`);
