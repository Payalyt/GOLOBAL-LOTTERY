const fs = require('fs');
const path = 'src/pages/Dashboard.tsx';
let content = fs.readFileSync(path, 'utf8');

const startIndex = content.indexOf('{/* TAB 3: Manage Winnings */}');
const endIndex = content.indexOf('{/* TAB 5: My Orders */}');

if (startIndex !== -1 && endIndex !== -1) {
    content = content.substring(0, startIndex) + content.substring(endIndex);
    fs.writeFileSync(path, content);
    console.log('Tabs removed successfully!');
} else {
    console.error('Could not find start or end tags.');
}
