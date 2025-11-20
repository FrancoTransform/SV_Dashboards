const XLSX = require('xlsx');
const fs = require('fs');

const workbook = XLSX.readFile('data/2025_Q3_RYG_Analysis.xlsx');

// Function to clean column names and extract data
function parseRYGSheet(sheetName) {
  const worksheet = workbook.Sheets[sheetName];
  const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

  if (rawData.length < 2) return [];

  // Find the header row (row with "Company" in first few columns)
  let headerRowIndex = -1;
  for (let i = 0; i < Math.min(5, rawData.length); i++) {
    const row = rawData[i];
    if (row.some(cell => cell === 'Company')) {
      headerRowIndex = i;
      break;
    }
  }

  if (headerRowIndex === -1) {
    console.log(`No header found in ${sheetName}`);
    return [];
  }

  const headers = rawData[headerRowIndex].map(h =>
    h ? h.toString().replace(/\r\n/g, ' ').trim() : ''
  );

  // Find the "Company" column index
  const companyColIndex = headers.indexOf('Company');
  if (companyColIndex === -1) {
    console.log(`No Company column in ${sheetName}`);
    return [];
  }

  // Parse data rows
  const companies = [];
  for (let i = headerRowIndex + 1; i < rawData.length; i++) {
    const row = rawData[i];

    // Skip if no company name or if it's empty
    if (!row[companyColIndex] || row[companyColIndex] === '') continue;

    const company = {};
    headers.forEach((header, idx) => {
      if (header && header !== '') {
        company[header] = row[idx] !== undefined ? row[idx] : '';
      }
    });

    // Only add if we have a valid company name (string)
    if (typeof company['Company'] === 'string' && company['Company'].trim() !== '') {
      companies.push(company);
    }
  }

  return companies;
}

// Parse all fund sheets
const funds = {
  fundI: parseRYGSheet('Fund I RYG'),
  fundII: parseRYGSheet('Fund II RYG'),
  fundIII: parseRYGSheet('Fund III RYG'),
  gofI: parseRYGSheet('GOF I RYG'),
  gofII: parseRYGSheet('GOF II RYG')
};

// Write to JSON file
fs.writeFileSync(
  'public/mart_investment_portfolio.json',
  JSON.stringify(funds, null, 2)
);

console.log('Conversion complete!');
console.log(`Fund I: ${funds.fundI.length} companies`);
console.log(`Fund II: ${funds.fundII.length} companies`);
console.log(`Fund III: ${funds.fundIII.length} companies`);
console.log(`GOF I: ${funds.gofI.length} companies`);
console.log(`GOF II: ${funds.gofII.length} companies`);

// Show sample data
console.log('\nSample Fund I company:');
console.log(JSON.stringify(funds.fundI[0], null, 2));

