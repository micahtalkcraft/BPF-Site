const fs = require('fs');
const path = 'C:/Users/Admin/.claude/projects/c--Users-Admin-OneDrive-Documents-BPF-Site/724f3f43-adce-461b-846a-fd6844715778.jsonl';
const lines = fs.readFileSync(path, 'utf-8').split('\n');

// Find all compaction boundaries and check the following user messages (which are compaction summaries)
console.log('Looking for compaction summaries...\n');
for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.length === 0) continue;
    try {
        const obj = JSON.parse(line);
        if (obj.subtype === 'compact_boundary') {
            console.log('Compaction boundary at line ' + (i+1));
            // Check the next line for the summary
            if (i + 1 < lines.length) {
                const nextLine = lines[i+1].trim();
                try {
                    const nextObj = JSON.parse(nextLine);
                    let text = '';
                    const content = nextObj.message ? nextObj.message.content : '';
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
                    if (text.includes('FXIFY') && !text.includes('FXIFY Futures')) {
                        console.log('  -> Next line ' + (i+2) + ' mentions FXIFY (not Futures), length: ' + text.length);
                        // Search for specific FXIFY CFD data points
                        if (text.includes('Instant') && text.includes('Lightning')) {
                            console.log('  -> Contains Instant and Lightning challenge references');
                        }
                        if (text.includes('PROPFIRMS15')) {
                            console.log('  -> Contains PROPFIRMS15');
                        }
                        if (text.includes('4.4/5')) {
                            console.log('  -> Contains 4.4/5 Trustpilot');
                        }
                    }
                } catch (e) {}
            }
            console.log('');
        }
    } catch (e) {}
}

// Also look for user messages between lines 5000-7776 that might be the FXIFY CFD detailed review
console.log('\n\nSearching for large user messages (>15000 chars) between lines 5000-7776 containing FXIFY challenge details:');
for (let i = 4999; i < 7776; i++) {
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
            if (text.length > 15000 && text.includes('FXIFY')) {
                console.log('Line ' + (i+1) + ' (length: ' + text.length + '): ' + text.substring(0, 300));
                console.log('Contains Lightning:', text.includes('Lightning'));
                console.log('Contains Three Step:', text.includes('Three Step'));
                console.log('Contains Trustpilot:', text.includes('Trustpilot'));
                console.log('---');
            }
        }
    } catch (e) {}
}
