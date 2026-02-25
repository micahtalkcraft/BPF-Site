const fs = require('fs');
const path = 'C:/Users/Admin/.claude/projects/c--Users-Admin-OneDrive-Documents-BPF-Site/724f3f43-adce-461b-846a-fd6844715778.jsonl';
const lines = fs.readFileSync(path, 'utf-8').split('\n');

// The compaction summary at line 7777 is the most detailed. Let's extract the section about FXIFY (CFD)
const line7777 = lines[7776].trim();
const obj = JSON.parse(line7777);
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

// Find the section about FXIFY CFD
const fxifyStart = text.indexOf('FXIFY (CFD)');
if (fxifyStart >= 0) {
    // Get a large chunk starting from FXIFY (CFD)
    const section = text.substring(fxifyStart, fxifyStart + 5000);
    console.log('FXIFY (CFD) section from compaction summary at line 7777:');
    console.log(section);
}
