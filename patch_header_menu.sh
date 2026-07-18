#!/bin/bash
sed -i 's/<button \n              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}/<button \n              style={{ display: siteConfig.slideMenuEnabled === false ? "none" : "block" }}\n              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}/g' src/components/Header.tsx
