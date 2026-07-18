const fs = require('fs');
let content = fs.readFileSync('src/pages/Admin.tsx', 'utf-8');

if (!content.includes('import { Globe')) {
  content = content.replace("import { Users, Settings,", "import { Users, Settings, Globe, List,");
}
if (!content.includes('import { toast }')) {
  content = content.replace("import { Trophy, Clock, X", "import { Trophy, Clock, X, toast");
  content = content.replace("import { Trash2,", "import { Trash2,");
  // If toast still not imported from lucide-react or sonner? Wait, where is toast from? 
}

fs.writeFileSync('src/pages/Admin.tsx', content);
