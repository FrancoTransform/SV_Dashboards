const XLSX = require('xlsx');

const workbook = XLSX.readFile('data/2025_Q3_RYG_Analysis.xlsx');

console.log('Sheet names:');
workbook.SheetNames.forEach(name => {
  console.log(`  - ${name}`);
});

console.log('\n');

workbook.SheetNames.forEach(sheetName => {
  console.log(`\n=== Sheet: ${sheetName} ===`);
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
  
  if (data.length > 0) {
    console.log(`Columns: ${Object.keys(data[0]).join(', ')}`);
    console.log(`Rows: ${data.length}`);
    console.log('\nFirst 3 rows:');
    console.log(JSON.stringify(data.slice(0, 3), null, 2));
  } else {
    console.log('(Empty sheet)');
  }
});

