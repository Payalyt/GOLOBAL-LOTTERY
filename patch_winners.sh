#!/bin/bash
node -e "
const fs = require('fs');
let code = fs.readFileSync('src/pages/Winners.tsx', 'utf8');

code = code.replace(
  /const activeVideoWinners = dbVideoWinners\.length > 0\s*\?\s*dbVideoWinners\.filter\(vw => vw\.isActive !== false\)\s*:\s*videoWinners;/,
  \`const activeVideoWinners = dbVideoWinners.length > 0 ? dbVideoWinners.filter(vw => vw.isActive !== false) : videoWinners;
  const activeGrandWinners = siteConfig?.grandPrizeWinners?.length ? siteConfig.grandPrizeWinners.filter(gw => gw.isActive !== false) : grandWinners;
  const activeDrawResults = siteConfig?.drawResults || [];\`
);

code = code.replace(
  /grandWinners\.map\(\(winner, index\) => \(/g,
  \"activeGrandWinners.map((winner: any, index: number) => (\"
);

fs.writeFileSync('src/pages/Winners.tsx', code);
"
