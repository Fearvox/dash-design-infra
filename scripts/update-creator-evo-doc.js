const fs = require('fs');
const filePath = 'docs/CREATOR_EVOLUTION_ENGINE.md';
let content = fs.readFileSync(filePath, 'utf8');

const marker = 'Fourth concrete token-alignment step — second cross-surface convergence.';
const insertAfter = '- [`creator-muted-token-alignment-route`]';

const idx = content.indexOf(insertAfter);
if (idx === -1) { console.log('insert point not found'); process.exit(1); }

// Find the end of the muted line
const endOfMutedLine = content.indexOf('\n', idx);
const before = content.slice(0, endOfMutedLine + 1);
const after = content.slice(endOfMutedLine + 1);

const newEntry = `- [\`creator-amber-token-alignment-route\`](../examples/creator-social-card.html): CSS --amber token alignment mutation (PR #78); aligns social-card (\`#c57a1d\`→\`#c47a1f\`) and prompt-dna (\`#b86b17\`→\`#c47a1f\`) to warm-paper consensus \`#c47a1f\` — \`--amber\` converges from 4→3 distinct values across warm-paper family. browser-demo \`#ff9f6e\` and manim-scene \`#d4a373\` retain intentional creative-hybrid divergence. All surface gates pass (social-card, prompt-dna, poster). Fifth concrete token-alignment step — third cross-surface convergence of a single token.
`;

fs.writeFileSync(filePath, before + newEntry + after);
console.log('Done');