const fs = require('fs');
const content = fs.readFileSync('controllers/rent-order.controller.js', 'utf8');

let line = 1;
let col = 1;
const stack = [];
let inString = false;
let stringChar = null;
let inCommentLine = false;
let inCommentBlock = false;

for (let i = 0; i < content.length; i++) {
  const c = content[i];
  const next = content[i+1];
  
  if (c === '\n') {
    line++;
    col = 1;
    inCommentLine = false;
    continue;
  }
  col++;

  if (inCommentLine) continue;

  if (inCommentBlock) {
    if (c === '*' && next === '/') {
      inCommentBlock = false;
      i++;
      col++;
    }
    continue;
  }

  if (inString) {
    if (c === '\\') {
      i++; col++; continue;
    }
    if (c === stringChar) {
      inString = false;
    }
    continue;
  }

  if (c === '/' && next === '/') {
    inCommentLine = true;
    i++; col++; continue;
  }
  if (c === '/' && next === '*') {
    inCommentBlock = true;
    i++; col++; continue;
  }

  if (c === '"' || c === "'" || c === '`') {
    inString = true;
    stringChar = c;
    continue;
  }

  if (c === '{' || c === '(' || c === '[') {
    stack.push({ char: c, line, col });
  } else if (c === '}' || c === ')' || c === ']') {
    const expected = c === '}' ? '{' : c === ')' ? '(' : '[';
    if (stack.length === 0) {
      console.log(`Unexpected ${c} at line ${line}, col ${col}`);
    } else {
      const top = stack.pop();
      if (top.char !== expected) {
        console.log(`Mismatched ${c} at line ${line}, col ${col}. Expected to close ${top.char} from line ${top.line}`);
      }
    }
  }
}

if (stack.length > 0) {
  console.log('Unclosed brackets:');
  stack.forEach(s => console.log(`${s.char} at line ${s.line}, col ${s.col}`));
} else {
  console.log('All brackets match!');
}
