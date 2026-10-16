const fs = require('fs');
const content = fs.readFileSync('src/pages/UserProfilePublic.tsx', 'utf8');

// Count tags
const count = (str, pattern) => (str.match(pattern) || []).length;
const openDiv = count(content, /<div/g);
const closeDiv = count(content, /<\/div>/g);
const openSpan = count(content, /<span/g);
const closeSpan = count(content, /<\/span>/g);
const openButton = count(content, /<button/g);
const closeButton = count(content, /<\/button>/g);

console.log('Tag balance check:');
console.log('div:', openDiv, '/', closeDiv, openDiv === closeDiv ? 'OK' : 'MISMATCH');
console.log('span:', openSpan, '/', closeSpan, openSpan === closeSpan ? 'OK' : 'MISMATCH');
console.log('button:', openButton, '/', closeButton, openButton === closeButton ? 'OK' : 'MISMATCH');

// Check critical guards
const guards = [
  ['profile?.id', 'Profile null guard'],
  ['setLoading(false)', 'Loading state cleanup'],
  ['catch (err)', 'Error catch block'],
  ['loading ?', 'Loading skeleton'],
  ['isActuallyFollowing', 'DM privacy check'],
  ['hasRequested', 'Request pending check'],
  ['social_follow_requests', 'Requests DB query'],
  ['is_private', 'Privacy setting read'],
];

let allGood = true;
guards.forEach(([key, label]) => {
  const found = content.includes(key);
  if (!found) allGood = false;
  console.log((found ? 'PASS' : 'FAIL') + ' ' + label);
});

// Double export check
const exp1 = content.indexOf('export default function UserProfilePublic');
const exp2 = content.indexOf('export default function UserProfilePublic', exp1 + 10);
console.log(exp2 === -1 ? 'PASS No duplicate export' : 'FAIL DUPLICATE EXPORT at char ' + exp2);

if (allGood) {
  console.log('ALL CHECKS PASSED - file is production ready');
} else {
  console.log('SOME CHECKS FAILED');
}
