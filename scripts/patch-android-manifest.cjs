// Adds the com.optiq.app://login-callback link to the Android project so that
// Google sign-in, email verification and password reset links open the app.
const fs = require('fs');

const file = 'android/app/src/main/AndroidManifest.xml';
let xml = fs.readFileSync(file, 'utf8');

if (xml.includes('login-callback')) {
  console.log('AndroidManifest.xml already has the sign-in link.');
  process.exit(0);
}

const filter = [
  '            <intent-filter>',
  '                <action android:name="android.intent.action.VIEW" />',
  '                <category android:name="android.intent.category.DEFAULT" />',
  '                <category android:name="android.intent.category.BROWSABLE" />',
  '                <data android:scheme="com.optiq.app" android:host="login-callback" />',
  '            </intent-filter>',
  '',
].join('\n');

const close = xml.indexOf('</activity>');
const at = close < 0 ? -1 : xml.lastIndexOf('\n', close) + 1; // start of that line
if (at < 0) {
  console.error('Could not find </activity> in AndroidManifest.xml');
  process.exit(1);
}

xml = xml.slice(0, at) + filter + xml.slice(at);
fs.writeFileSync(file, xml);
console.log('Added the sign-in link to AndroidManifest.xml.');
