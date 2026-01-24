import fs from 'fs';

const filePath = 'đề 2.json';
let content = fs.readFileSync(filePath, 'utf8');

// Fix: Replace ${...}$ with $...$ using non-greedy matching
// Use [\s\S] to match any character including newlines, or use dotAll flag
content = content.replace(/\$\{([\s\S]*?)\}\$/g, '$$$1$$');

fs.writeFileSync(filePath, content, 'utf8');

console.log('✅ Fixed all mathematical symbols!');
console.log('Converted all ${...}$ to $...$');
