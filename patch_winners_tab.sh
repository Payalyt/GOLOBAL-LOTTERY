#!/bin/bash
node -e "
const fs = require('fs');
let code = fs.readFileSync('src/pages/Winners.tsx', 'utf8');

code = code.replace(
  /\{activeTab === 'live' && 'Live Draw Winners'\}/,
  \`{activeTab === 'live' && 'All Game Winners'}\`
);

code = code.replace(
  />Live Draw Winners</,
  \`>All Game Winners<\`
);

fs.writeFileSync('src/pages/Winners.tsx', code);
"
