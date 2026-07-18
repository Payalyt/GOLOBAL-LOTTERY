#!/bin/bash
node -e "
const fs = require('fs');
let code = fs.readFileSync('src/components/Header.tsx', 'utf8');

code = code.replace(
  /{ name: 'PICK 2', link: '\\/results\\/pick2', color: 'bg-orange-500', text: 'SEE ALL RESULTS' },/,
  \`{ name: 'PICK 2', link: '/results/pick2', color: 'bg-orange-500', text: 'SEE ALL RESULTS' },
          { name: 'POK', link: '/results/POK', color: 'bg-indigo-600', text: 'SEE ALL RESULTS' },\`
);

code = code.replace(
  /{ name: 'PICK 2', link: '\\/winners\\/pick2', color: 'bg-orange-500', text: 'SEE ALL WINNERS' },/,
  \`{ name: 'PICK 2', link: '/winners/pick2', color: 'bg-orange-500', text: 'SEE ALL WINNERS' },
        { name: 'POK', link: '/winners/POK', color: 'bg-indigo-600', text: 'SEE ALL WINNERS' },\`
);

code = code.replace(
  /to=\"\\/results\\/mega7\"/,
  \`to=\"/results\"\`
);

code = code.replace(
  /to=\"\\/winners\\/mega7\"/,
  \`to=\"/winners\"\`
);


fs.writeFileSync('src/components/Header.tsx', code);
"
