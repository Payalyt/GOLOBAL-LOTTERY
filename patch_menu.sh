#!/bin/bash
sed -i '/<h3 className="text-sm font-black uppercase text-gray-800 dark:text-gray-200 mb-4 border-b border-gray-100 dark:border-zinc-800 pb-3">Theme Colors<\/h3>/a \
                <div className="mb-6">\
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400 mb-1.5">Show 3-Line Mobile Menu</label>\
                  <label className="flex items-center cursor-pointer">\
                    <div className="relative">\
                      <input type="checkbox" className="sr-only" name="slideMenuEnabled" checked={configForm.slideMenuEnabled !== false} onChange={handleChange} />\
                      <div className={`block w-10 h-6 rounded-full transition-colors ${configForm.slideMenuEnabled !== false ? "bg-amber-500" : "bg-gray-300 dark:bg-zinc-700"}`}></div>\
                      <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${configForm.slideMenuEnabled !== false ? "transform translate-x-4" : ""}`}></div>\
                    </div>\
                    <span className="ml-3 text-sm font-bold text-gray-700 dark:text-gray-300">{configForm.slideMenuEnabled !== false ? "Enabled" : "Disabled"}</span>\
                  </label>\
                </div>\
' src/pages/Admin.tsx
