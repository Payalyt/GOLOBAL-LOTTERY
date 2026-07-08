#!/bin/bash
# 1. Add lg:hidden back to the mobile status bar
sed -i 's/className="flex justify-between items-center bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-200 dark:border-zinc-800\/80 p-4 rounded-3xl/className="lg:hidden flex justify-between items-center bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-200 dark:border-zinc-800\/80 p-4 rounded-3xl/g' src/pages/Admin.tsx

# 2. Add the Theme toggle to the Desktop Admin Banner
# Find the line:
# <div className="flex items-center gap-3">
#             <button 
#               onClick={() => navigate('/dashboard')}

# Let's insert the theme toggle right after <div className="flex items-center gap-3"> in the desktop banner
