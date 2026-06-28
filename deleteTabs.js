const fs = require('fs');

const path = 'src/pages/Dashboard.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Remove state variables (lines 76 to 84 roughly)
content = content.replace(/\/\/ Transfer state\n\s*const \[transferEmail[\s\S]*?setWinningIban\('');\n/m, '');

// 2. Remove tabs from menuItems
content = content.replace(/\s*\{\s*label:\s*'Manage Winnings',\s*icon:\s*TrendingUp\s*\},/g, '');
content = content.replace(/\s*\{\s*label:\s*'Transfer to Friend',\s*icon:\s*Send\s*\},/g, '');

// 3. Remove executeTransfer function
content = content.replace(/\s*\/\/ Balance transfer triggers\n\s*const executeTransfer = \(e: React\.FormEvent\) => \{[\s\S]*?setActiveTab\('Personal Details'\);\n\s*\};\n/m, '');

// 4. Remove TRANSFER button
content = content.replace(/\s*<button\s+type="button"\s+onClick=\{\(\) => setActiveTab\('Transfer to Friend'\)\}[\s\S]*?TRANSFER\s*<\/button>/m, '');

// 5. Remove Manage Winnings and Transfer to Friend tabs logic
content = content.replace(/\s*\{\/\* TAB 3: Manage Winnings \*\/\}([\s\S]*?)\{\/\* TAB 5: My Orders \*\/\}/m, '\n\n            {/* TAB 5: My Orders */}');

fs.writeFileSync(path, content);
console.log('Tabs removed successfully!');
