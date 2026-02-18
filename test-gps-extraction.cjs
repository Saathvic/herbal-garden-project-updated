const fs = require('fs');
const FormData = require('form-data');
const axios = require('axios');
const exifr = require('exifr');

async function testGPSExtraction() {
  const imagePath = 'D:\\Studies\\college\\College project\\V3HGGABHRC\\Geo_tag_test\\image.png';
  
  console.log('🌿 Testing GPS Extraction & Plant Identification\n');
  console.log('=' .repeat(60));
  
  // Step 1: Extract GPS from image
  console.log('\n📍 Step 1: Extracting GPS data from image...');
  try {
    const gps = await exifr.gps(imagePath);
    
    if (gps && gps.latitude != null && gps.longitude != null) {
      console.log('✅ GPS Data Found!');
      console.log(`   Latitude: ${gps.latitude.toFixed(6)}`);
      console.log(`   Longitude: ${gps.longitude.toFixed(6)}`);
      console.log(`   📍 Google Maps: https://www.google.com/maps?q=${gps.latitude},${gps.longitude}`);
      
      // Step 2: Send to backend for plant identification
      console.log('\n🔍 Step 2: Sending to AI for plant identification...');
      
      const formData = new FormData();
      formData.append('image', fs.createReadStream(imagePath), {
        filename: 'image.png',
        contentType: 'image/png'
      });
      formData.append('plantId', 'test-geotag');
      formData.append('latitude', gps.latitude.toString());
      formData.append('longitude', gps.longitude.toString());
      
      const response = await axios.post('http://localhost:3000/identify-plant', formData, {
        headers: formData.getHeaders(),
        timeout: 30000
      });
      
      console.log('\n✅ AI Identification Complete!\n');
      console.log('=' .repeat(60));
      console.log(`🌿 Identified Plant: ${response.data.identified_plant}`);
      console.log(`\n💊 Medical Value:\n   ${response.data.medical_value}`);
      
      if (response.data.location_stored) {
        console.log('\n✅ Location Successfully Stored in Pinecone Vector Database!');
      }
      
      console.log('\n' + '='.repeat(60));
      console.log('\n✅ TEST PASSED: GPS extraction and plant identification working!\n');
      
    } else {
      console.log('⚠️  No GPS data found in image');
      console.log('   The image may not have location metadata.');
    }
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.response) {
      console.error('   Server Response:', error.response.data);
    }
  }
}

testGPSExtraction();
