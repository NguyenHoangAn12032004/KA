// Test script để verify button functionality
// Chạy script này trong browser console khi ở trang CompaniesPage

console.log('🧪 Testing button functionality...');

// Test 1: Check if handlers exist
console.log('1. Checking if handlers exist in window scope...');
if (typeof handleEditCompany !== 'undefined') {
  console.log('✅ handleEditCompany exists');
} else {
  console.log('❌ handleEditCompany not found in global scope');
}

// Test 2: Simulate button click
console.log('2. Simulating Edit button click...');
const editButtons = document.querySelectorAll('button[aria-label*="Edit"], button:contains("Edit")');
console.log(`Found ${editButtons.length} Edit buttons`);

if (editButtons.length > 0) {
  console.log('Clicking first Edit button...');
  editButtons[0].click();
} else {
  console.log('❌ No Edit buttons found');
}

// Test 3: Check API connectivity
console.log('3. Testing API connectivity...');
fetch('http://localhost:5000/health')
  .then(response => response.json())
  .then(data => {
    console.log('✅ Backend server is running:', data);
  })
  .catch(error => {
    console.log('❌ Backend server not reachable:', error);
  });

// Test 4: Check companies API
console.log('4. Testing Companies API...');
fetch('http://localhost:5000/api/companies')
  .then(response => response.json())
  .then(data => {
    console.log('✅ Companies API working:', data);
  })
  .catch(error => {
    console.log('❌ Companies API error:', error);
  });
