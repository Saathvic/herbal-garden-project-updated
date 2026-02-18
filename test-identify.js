const fetch = require('node-fetch');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function testIdentify() {
  try {
    // Find a test image
    const testImagePath = path.join(__dirname, 'plants images');
    const files = fs.readdirSync(testImagePath);
    const imageFile = files.find(f => f.match(/\.(jpg|jpeg|png)$/i));
    
    if (!imageFile) {
      console.log('❌ No test image found in plants images folder');
      return;
    }

    console.log(`📸 Using test image: ${imageFile}`);
    
    const formData = new FormData();
    formData.append('image', fs.createReadStream(path.join(testImagePath, imageFile)));
    formData.append('plantId', 'test-plant');
    
    console.log('🔄 Sending request to http://localhost:3000/identify-plant...');
    
    const response = await fetch('http://localhost:3000/identify-plant', {
      method: 'POST',
      body: formData,
    });
    
    console.log(`📊 Response status: ${response.status}`);
    
    const data = await response.json();
    console.log('📦 Response data:', JSON.stringify(data, null, 2));
    
    if (response.ok) {
      console.log('✅ Test passed!');
    } else {
      console.log('❌ Test failed!');
    }
  } catch (error) {
    console.error('❌ Error during test:', error.message);
    console.error('Full error:', error);
  }
}

testIdentify();
