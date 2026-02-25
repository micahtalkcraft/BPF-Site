const fs = require('fs');
const path = 'C:/Users/Admin/.claude/projects/c--Users-Admin-OneDrive-Documents-BPF-Site/724f3f43-adce-461b-846a-fd6844715778.jsonl';
const lines = fs.readFileSync(path, 'utf-8').split('\n');

// Check compaction summaries that contain FXIFY details
const summaryLines = [4574, 4367, 4193, 3963, 2438, 1713];

for (const lineNum of summaryLines) {
    const line = lines[lineNum - 1].trim();
    try {
        const obj = JSON.parse(line);
        let text = '';
        const content = obj.message ? obj.message.content : '';
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

        // Search for FXIFY-related content
        const fxifyIdx = text.indexOf('FXIFY');
        if (fxifyIdx >= 0) {
            // Check if it has challenge details
            const hasInstant = text.includes('Instant');
            const hasLightning = text.includes('Lightning');
            const hasThreeStep = text.includes('Three Step');
            const hasFees = text.includes('$39') || text.includes('$2,950');
            const hasTrustpilot44 = text.includes('4.4/5');
            const hasFXPIG = text.includes('FXPIG');

            console.log('Line ' + lineNum + ' (length ' + text.length + '):');
            console.log('  Has Instant:', hasInstant, '| Lightning:', hasLightning, '| Three Step:', hasThreeStep);
            console.log('  Has $39 or $2,950:', hasFees, '| 4.4/5:', hasTrustpilot44, '| FXPIG:', hasFXPIG);

            // Find and print the FXIFY sections
            let searchStart = 0;
            while (true) {
                const idx = text.indexOf('FXIFY', searchStart);
                if (idx === -1) break;
                // Print context around FXIFY mentions (but skip FXIFY Futures)
                const context = text.substring(Math.max(0, idx - 50), Math.min(text.length, idx + 200));
                if (!context.includes('FXIFY Futures') || context.includes('FXIFY (CFD)') || context.includes('FXIFY review')) {
                    // Only print if not purely about FXIFY Futures
                    if (context.includes('FXIFY (CFD)') || context.includes('fxify.json') || context.includes('FXIFY review') || context.includes('Instant') || context.includes('Lightning')) {
                        console.log('  Context: ...' + context.replace(/\n/g, '\\n') + '...');
                    }
                }
                searchStart = idx + 5;
            }
            console.log('---');
        }
    } catch (e) {
        console.log('Line ' + lineNum + ': Parse error');
    }
}
