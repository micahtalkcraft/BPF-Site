const fs = require('fs');
const path = 'C:/Users/Admin/.claude/projects/c--Users-Admin-OneDrive-Documents-BPF-Site/724f3f43-adce-461b-846a-fd6844715778.jsonl';
const lines = fs.readFileSync(path, 'utf-8').split('\n');

// Find user messages between lines 7600-7776 (before compaction)
const userMessages = [];
for (let i = 7599; i < Math.min(lines.length, 7775); i++) {
    const line = lines[i].trim();
    if (line.length === 0) continue;
    try {
        const obj = JSON.parse(line);
        if (obj.type === 'user' && obj.message && obj.message.role === 'user') {
            let preview = '';
            const content = obj.message.content;
            let contentLength = 0;
            if (typeof content === 'string') {
                preview = content.substring(0, 300);
                contentLength = content.length;
            } else if (Array.isArray(content)) {
                for (const item of content) {
                    if (item.type === 'text') {
                        preview = item.text.substring(0, 300);
                        contentLength = item.text.length;
                        break;
                    }
                }
            }
            userMessages.push({ lineNum: i + 1, preview, contentLength });
        }
    } catch (e) {}
}

console.log('Found ' + userMessages.length + ' user messages between lines 7600-7776');
for (const msg of userMessages) {
    console.log('Line ' + msg.lineNum + ' (length: ' + msg.contentLength + '): ' + msg.preview);
    console.log('---');
}
