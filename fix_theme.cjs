const fs = require('fs');
let code = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

if (!code.includes("useEffect(() => {")) {
  code = code.replace(/const \[theme, setTheme\] = useState<"dark" \| "light">("dark");/, `const [theme, setTheme] = useState<"dark" | "light">("dark");\n\n  React.useEffect(() => {\n    if (theme === 'dark') {\n      document.documentElement.classList.add('dark');\n    } else {\n      document.documentElement.classList.remove('dark');\n    }\n  }, [theme]);`);
} else if (!code.includes("document.documentElement.classList")) {
  code = code.replace(/const \[theme, setTheme\] = useState<"dark" \| "light">("dark");/, `const [theme, setTheme] = useState<"dark" | "light">("dark");\n\n  React.useEffect(() => {\n    if (theme === 'dark') {\n      document.documentElement.classList.add('dark');\n    } else {\n      document.documentElement.classList.remove('dark');\n    }\n  }, [theme]);`);
}

fs.writeFileSync('src/pages/Admin.tsx', code);
