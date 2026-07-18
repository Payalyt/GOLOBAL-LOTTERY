#!/bin/bash
node -e "
const fs = require('fs');
let code = fs.readFileSync('src/components/Header.tsx', 'utf8');

code = code.replace(/<button\s+onClick=\{\(\) => setIsMobileMenuOpen\(\!isMobileMenuOpen\)\}/, '<button style={{ display: siteConfig.slideMenuEnabled === false ? \"none\" : \"flex\" }} onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}');

fs.writeFileSync('src/components/Header.tsx', code);
"
