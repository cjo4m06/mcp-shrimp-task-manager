// Test ID generation logic to understand the mismatch

const generateUniqueId = (text, parentPath) => {
  const cleanPath = [...parentPath, text].map(part => 
    part.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')
  ).filter(part => part.length > 0);
  return cleanPath.join('-');
};

console.log('=== Testing ID Generation ===');

// Simulate TOC generation
const tocParentPath = [];
console.log('\n--- TOC Generation ---');

// H1: "🦐 Shrimp Task Manager Viewer"
tocParentPath.length = 0;
tocParentPath.push('🦐 Shrimp Task Manager Viewer');
const tocH1Id = generateUniqueId('🦐 Shrimp Task Manager Viewer', tocParentPath.slice(0, -1));
console.log(`H1 TOC: "${tocH1Id}" (parentPath: [${tocParentPath.slice(0, -1).join(', ')}])`);

// H2: "🚀 Quick Start"
tocParentPath.length = 1; // Keep only top-level parent
tocParentPath.push('🚀 Quick Start');
const tocH2Id = generateUniqueId('🚀 Quick Start', tocParentPath.slice(0, -1));
console.log(`H2 TOC: "${tocH2Id}" (parentPath: [${tocParentPath.slice(0, -1).join(', ')}])`);

// Simulate Content rendering
const contentParentPath = [];
console.log('\n--- Content Rendering ---');

// H1: "🦐 Shrimp Task Manager Viewer"
contentParentPath.length = 0;
contentParentPath.push('🦐 Shrimp Task Manager Viewer');
const contentH1Id = generateUniqueId('🦐 Shrimp Task Manager Viewer', contentParentPath.slice(0, -1));
console.log(`H1 Content: "${contentH1Id}" (parentPath: [${contentParentPath.slice(0, -1).join(', ')}])`);

// H2: "🚀 Quick Start"
contentParentPath.length = Math.min(1, contentParentPath.length);
contentParentPath.push('🚀 Quick Start');
const contentH2Id = generateUniqueId('🚀 Quick Start', contentParentPath.slice(0, -1));
console.log(`H2 Content: "${contentH2Id}" (parentPath: [${contentParentPath.slice(0, -1).join(', ')}])`);

console.log('\n--- Comparison ---');
console.log(`H1 Match: ${tocH1Id === contentH1Id ? 'YES' : 'NO'} (${tocH1Id} vs ${contentH1Id})`);
console.log(`H2 Match: ${tocH2Id === contentH2Id ? 'YES' : 'NO'} (${tocH2Id} vs ${contentH2Id})`);