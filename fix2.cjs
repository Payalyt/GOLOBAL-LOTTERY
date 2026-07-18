const fs = require('fs');
let code = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

// I will just replace the whole text from `                  {/* USDT */}` to `{/* CONTACT SETTINGS */}`
code = code.replace(/                  \{\/\* USDT \*\/\}.*?\{\/\* CONTACT SETTINGS \*\/\}/s, `                  {/* USDT */}
                  <div className="p-5 border border-gray-200 dark:border-zinc-800 rounded-xl space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-green-500 uppercase tracking-wide">USDT (Crypto)</h4>
                      <label className="flex items-center cursor-pointer">
                        <div className="relative">
                          <input type="checkbox" className="sr-only" name="usdtEnabled" checked={configForm.usdtEnabled || false} onChange={handleChange} />
                          <div className={\`block w-10 h-6 rounded-full transition-colors \${configForm.usdtEnabled ? 'bg-green-500' : 'bg-gray-300 dark:bg-zinc-700'}\`}></div>
                          <div className={\`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform \${configForm.usdtEnabled ? 'transform translate-x-4' : ''}\`}></div>
                        </div>
                      </label>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400 mb-1.5">USDT Address (TRC20)</label>
                      <input type="text" name="usdtAddress" value={configForm.usdtAddress || ''} onChange={handleChange} className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm outline-none font-mono" />
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* CONTACT SETTINGS */}`);

// Also fix the bottom part with `</main>` error.
code = code.replace(/<\/main>\s*<\/div>\s*<\/div>\s*\)\;\s*\}/g, '</main></div></div>);\n}');

fs.writeFileSync('src/pages/Admin.tsx', code);
