const fs = require('fs');
const path = 'C:/Users/Admin/.claude/projects/c--Users-Admin-OneDrive-Documents-BPF-Site/724f3f43-adce-461b-846a-fd6844715778.jsonl';
const lines = fs.readFileSync(path, 'utf-8').split('\n');

// The compaction summary at line 7777 says the FXIFY CFD review was the last user message.
// It must be between the FTMO review (line 7735) and the compaction (line 7776).
// Let me check ALL lines between 7735 and 7776 for user messages

console.log('All entries between lines 7735-7776:');
for (let i = 7734; i < 7776; i++) {
    const line = lines[i].trim();
    if (line.length === 0) continue;
    try {
        const obj = JSON.parse(line);
        let text = '';
        if (obj.message && obj.message.content) {
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
        }
        console.log('Line ' + (i+1) + ': type=' + obj.type + ', subtype=' + (obj.subtype || 'n/a') + ', textLen=' + text.length + (text.length > 0 ? ', preview=' + text.substring(0, 100) : ''));
    } catch (e) {
        console.log('Line ' + (i+1) + ': PARSE ERROR');
    }
}

// Also check lines 7770-7805
console.log('\nAll entries between lines 7770-7805:');
for (let i = 7769; i < Math.min(lines.length, 7805); i++) {
    const line = lines[i].trim();
    if (line.length === 0) continue;
    try {
        const obj = JSON.parse(line);
        let text = '';
        if (obj.message && obj.message.content) {
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
        }
        console.log('Line ' + (i+1) + ': type=' + obj.type + ', subtype=' + (obj.subtype || 'n/a') + ', textLen=' + text.length + (text.length > 0 ? ', preview=' + text.substring(0, 150) : ''));
    } catch (e) {
        console.log('Line ' + (i+1) + ': PARSE ERROR');
    }
}
