// Quick test of GridLayout algorithm logic
const nodes = [
  { id: 'A', x: 0, y: 0 },
  { id: 'B', x: 0, y: 0 },
  { id: 'C', x: 0, y: 0 },
  { id: 'D', x: 0, y: 0 },
];

const edges = [
  { source: 'A', target: 'B' },
  { source: 'A', target: 'C' },
  { source: 'B', target: 'D' },
];

// Simulate BFS level assignment
const levels = new Map();
const edgeMap = new Map();

edges.forEach(edge => {
  if (!edgeMap.has(edge.source)) edgeMap.set(edge.source, []);
  edgeMap.get(edge.source).push(edge.target);
});

const queue = [nodes[0].id];
levels.set(nodes[0].id, 0);

while (queue.length > 0) {
  const current = queue.shift();
  const currentLevel = levels.get(current);
  const children = edgeMap.get(current) || [];

  for (const child of children) {
    if (!levels.has(child)) {
      levels.set(child, currentLevel + 1);
      queue.push(child);
    }
  }
}

console.log('Node levels:');
for (const [nodeId, level] of levels.entries()) {
  console.log(`  ${nodeId}: level ${level}`);
}

// Expected output:
// A: level 0
// B: level 1
// C: level 1
// D: level 2

const GRID_SPACING_X = 200;
const GRID_SPACING_Y = 120;

const byLevel = new Map();
for (const [nodeId, level] of levels.entries()) {
  if (!byLevel.has(level)) byLevel.set(level, []);
  byLevel.get(level).push(nodeId);
}

console.log('\nGrouped by level:');
for (const [level, nodeIds] of byLevel.entries()) {
  console.log(`  Level ${level}: ${nodeIds.join(', ')}`);
}

// Simulate positioning
const positioned = new Map();
const maxLevel = Math.max(...Array.from(levels.values()));

for (const [level, nodeIds] of byLevel.entries()) {
  const x = level * GRID_SPACING_X;
  const totalHeight = nodeIds.length * GRID_SPACING_Y;
  const startY = -(totalHeight / 2) + (GRID_SPACING_Y / 2);

  nodeIds.forEach((nodeId, idx) => {
    const y = startY + idx * GRID_SPACING_Y;
    positioned.set(nodeId, { x, y });
  });
}

const centerX = (maxLevel * GRID_SPACING_X) / 2;
const centerY = 0;

console.log('\nFinal positions (after centering):');
for (const node of nodes) {
  const pos = positioned.get(node.id) ?? { x: 0, y: 0 };
  const finalX = pos.x - centerX;
  const finalY = pos.y - centerY;
  console.log(`  ${node.id}: (${finalX}, ${finalY})`);
}

console.log('\n✓ GridLayout algorithm test passed (no crashes)');
