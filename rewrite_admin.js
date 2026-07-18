const fs = require('fs');

let code = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

// The issue is in the main body. 
// I will find everything from `<main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">` 
// to `</main>` and replace it with a clean version.

// Actually, I can just use a simple regex replacement to fix the unclosed divs.
// The error is `Unexpected closing "main" tag does not match opening "div" tag`.
// That means there is a missing `</div>`.
// Let's count the number of opening `div` and closing `div` in `src/pages/Admin.tsx`.

let divsOpened = (code.match(/<div/g) || []).length;
let divsClosed = (code.match(/<\/div>/g) || []).length;

console.log("Opened divs: ", divsOpened);
console.log("Closed divs: ", divsClosed);

// We can just add `</div>` before `</main>` until it compiles? 
// No, the compiler error said: "The character "}" is not valid inside a JSX element" at line 303.
// This is because it is `</div> </div> </div> )}` 
// Let's replace `            </div>   303	            )}` with `</div></div></div>)}`
