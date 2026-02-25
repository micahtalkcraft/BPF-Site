const fs = require('fs');
const path = 'C:/Users/Admin/.claude/projects/c--Users-Admin-OneDrive-Documents-BPF-Site/724f3f43-adce-461b-846a-fd6844715778.jsonl';
const lines = fs.readFileSync(path, 'utf-8').split('\n');

// Check line 4295 - the FXIFY user message with Instant/Lightning
const line4295 = lines[4294].trim();
try {
    const obj = JSON.parse(line4295);
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
    console.log('Line 4295 - type:', obj.type, ', length:', text.length);
    console.log('FULL TEXT:');
    console.log(text);
} catch (e) {
    console.log('Error parsing line 4295:', e.message);
}
