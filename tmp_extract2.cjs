const fs = require('fs');
const path = 'C:/Users/Admin/.claude/projects/c--Users-Admin-OneDrive-Documents-BPF-Site/724f3f43-adce-461b-846a-fd6844715778.jsonl';
const lines = fs.readFileSync(path, 'utf-8').split('\n');

console.log('Total lines in file: ' + lines.length);

// Find ALL user messages with substantial content (>1000 chars) that mention FXIFY but NOT "Futures"
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
            if (text.length > 1000 && text.includes('FXIFY') && text.includes('Instant') && text.includes('Lightning')) {
                userMessages.push({ lineNum: i + 1, contentLength: text.length, preview: text.substring(0, 500) });
            }
        }
    } catch (e) {}
}

console.log('Found ' + userMessages.length + ' FXIFY CFD user messages');
for (const msg of userMessages) {
    console.log('Line ' + msg.lineNum + ' (length: ' + msg.contentLength + '):');
    console.log(msg.preview);
    console.log('---');
}
