const { getStaticPageList } = require('../src/lib/page-discovery');

console.log('Testing sidebar page discovery...\n');

const pages = getStaticPageList();
const grouped = {};

pages.forEach(page => {
  const category = page.category || 'Main';
  if (!grouped[category]) {
    grouped[category] = [];
  }
  grouped[category].push(page);
});

console.log('Discovered pages by category:\n');

Object.entries(grouped).forEach(([category, categoryPages]) => {
  console.log(`${category}:`);
  categoryPages.forEach(page => {
    console.log(`  - ${page.title} (${page.url})`);
  });
  console.log();
});

console.log(`Total pages discovered: ${pages.length}`);