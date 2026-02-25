const fs = require('fs');
const path = 'C:/Users/Admin/.claude/projects/c--Users-Admin-OneDrive-Documents-BPF-Site/724f3f43-adce-461b-846a-fd6844715778.jsonl';
const lines = fs.readFileSync(path, 'utf-8').split('\n');

// Find ALL user messages with substantial content (>5000 chars) that mention FXIFY
const userMessages = [];
for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.length === 0) continue;
    try {
        const obj = JSON.parse(line);
        if (obj.type === 'user' && obj.message && obj.message.role === 'user') {
            let text = '';
            const content = obj.message.content;
            if (typeof content === 'string') {
                text = content;
            } else if (Array.isArray(content)) {
                for (const item of content) {
                    if (item.type === 'text') {
                        text = item.text;
                        break;
                    }
                }
            }
            if (text.length > 5000 && text.includes('FXIFY') && !text.includes('FXIFY Futures')) {
                userMessages.push({ lineNum: i + 1, contentLength: text.length, preview: text.substring(0, 200), ending: text.substring(text.length - 200) });
            }
        }
    } catch (e) {}
}

console.log('Found ' + userMessages.length + ' FXIFY CFD long user messages (>5000 chars, no "FXIFY Futures")');
for (const msg of userMessages) {
    console.log('Line ' + msg.lineNum + ' (length: ' + msg.contentLength + '):');
    console.log('START: ' + msg.preview);
    console.log('END: ' + msg.ending);
    console.log('---');
}

// Also check for any user messages >10000 chars after line 7700
console.log('\n\nAll large user messages (>10000 chars) after line 7700:');
for (let i = 7699; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.length === 0) continue;
    try {
        const obj = JSON.parse(line);
        if (obj.type === 'user' && obj.message && obj.message.role === 'user') {
            let text = '';
            const content = obj.message.content;
            if (typeof content === 'string') {
                text = content;
            } else if (Array.isArray(content)) {
                for (const item of content) {
                    if (item.type === 'text') {
                        text = item.text;
                        break;
                    }
                }
            }
            if (text.length > 10000) {
                console.log('Line ' + (i + 1) + ' (length: ' + text.length + '): ' + text.substring(0, 200));
                console.log('---');
            }
        }
    } catch (e) {}
}
