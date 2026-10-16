const fs = require('fs');

let dlContent = fs.readFileSync('src/pages/DownloadAppPublic.tsx', 'utf8');
dlContent = dlContent.replace('import React from "react";', 'import React, { useState, useRef } from "react";');
dlContent = dlContent.replace('import { motion } from "framer-motion";', 'import { motion, AnimatePresence } from "framer-motion";');
dlContent = dlContent.replace('from "lucide-react";', 'Users, BookText, Sparkles, Crown } from "lucide-react";');

const extract = fs.readFileSync('temp_extract.tsx', 'utf8');
const withoutEnd = extract.replace('/* ════════════════', '');

dlContent = dlContent.replace('export default function DownloadAppPublic() {', withoutEnd + '\nexport default function DownloadAppPublic() {');
dlContent = dlContent.replace('{/* MOBILE APP FEATURES */}', '<AppShowcase onStart={handleStart} />\n\n      {/* MOBILE APP FEATURES */}');

fs.writeFileSync('src/pages/DownloadAppPublic.tsx', dlContent);

let landingContent = fs.readFileSync('src/pages/Landing.tsx', 'utf8');
landingContent = landingContent.replace(extract, '');
fs.writeFileSync('src/pages/Landing.tsx', landingContent);
console.log('Update complete.');
