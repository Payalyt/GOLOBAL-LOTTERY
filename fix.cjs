const fs = require('fs');
let code = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

// I'll replace any remaining `</div>  </div>  )}` before `CONTACT SETTINGS` with `</div></div></div>)}`
code = code.replace(/<\/div>\s*<\/div>\s*\)\}\s*\{\/\* CONTACT SETTINGS \*\/\}/g, '</div></div></div>)}\n{/* CONTACT SETTINGS */}');

fs.writeFileSync('src/pages/Admin.tsx', code);
