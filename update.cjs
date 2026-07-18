const fs = require('fs');
let content = fs.readFileSync('src/pages/Settings.tsx', 'utf8');

const startMarker = '                           {/* LOCATION DETAILS GRID (3 COLUMN) - PLACED AT THE TOP */}';
const endMarker = '                           {/* Hidden inputs triggers */}';

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker);

if (startIndex !== -1 && endIndex !== -1) {
    const newBlock = `                           <ProfileTab 
                              profile={profile} 
                              setProfile={setProfile} 
                              privacySettings={privacySettings} 
                              setPrivacySettings={setPrivacySettings} 
                              avatarUploadRef={avatarUploadRef} 
                              bannerUploadRef={bannerUploadRef} 
                           />\n\n`;
    content = content.substring(0, startIndex) + newBlock + content.substring(endIndex);
    fs.writeFileSync('src/pages/Settings.tsx', content);
    console.log('Success');
} else {
    console.error('Markers not found');
}
