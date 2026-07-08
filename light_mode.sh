#!/bin/bash
# Apply light mode classes to Admin.tsx

sed -i 's/bg-\[#070709\]/bg-[#FAF9FC]/g' src/pages/Admin.tsx
sed -i 's/bg-\[#09090b\]/bg-white/g' src/pages/Admin.tsx
sed -i 's/bg-\[#0d0d11\]/bg-white/g' src/pages/Admin.tsx
sed -i 's/bg-\[#0e0e12\]/bg-white/g' src/pages/Admin.tsx
sed -i 's/bg-zinc-950/bg-white/g' src/pages/Admin.tsx
sed -i 's/bg-zinc-900\/50/bg-zinc-50/g' src/pages/Admin.tsx
sed -i 's/bg-zinc-900/bg-zinc-50/g' src/pages/Admin.tsx
sed -i 's/border-zinc-800\/80/border-zinc-200/g' src/pages/Admin.tsx
sed -i 's/border-zinc-800\/70/border-zinc-200/g' src/pages/Admin.tsx
sed -i 's/border-zinc-800\/40/border-zinc-100/g' src/pages/Admin.tsx
sed -i 's/border-zinc-800/border-zinc-200/g' src/pages/Admin.tsx
sed -i 's/border-zinc-900\/80/border-zinc-200/g' src/pages/Admin.tsx
sed -i 's/border-zinc-700/border-zinc-300/g' src/pages/Admin.tsx

sed -i 's/text-zinc-100/text-zinc-900/g' src/pages/Admin.tsx
sed -i 's/text-zinc-200/text-zinc-800/g' src/pages/Admin.tsx
sed -i 's/text-zinc-300/text-zinc-700/g' src/pages/Admin.tsx
sed -i 's/text-zinc-400/text-zinc-500/g' src/pages/Admin.tsx

sed -i 's/hover:bg-zinc-800/hover:bg-zinc-100/g' src/pages/Admin.tsx
sed -i 's/hover:bg-zinc-900/hover:bg-zinc-100/g' src/pages/Admin.tsx
sed -i 's/hover:border-zinc-700/hover:border-zinc-300/g' src/pages/Admin.tsx

sed -i 's/shadow-xl/shadow-sm/g' src/pages/Admin.tsx
sed -i 's/shadow-2xl/shadow-md/g' src/pages/Admin.tsx

# Full screen layout fixes
sed -i 's/max-w-\[1600px\] mx-auto p-4 sm:p-8 space-y-8 pb-20/w-full p-2 sm:p-4 space-y-4 pb-20/g' src/pages/Admin.tsx
