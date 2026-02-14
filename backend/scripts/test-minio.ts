import { storageService } from '../src/services/storage.service';

async function testMinioConnection() {
  console.log('🚀 Starting MinIO Connection Test...');
  
  try {
    // 1. Create a dummy file buffer
    const content = 'Hello MinIO from IBISTEK Backend!';
    const buffer = Buffer.from(content);
    const file = new File([buffer], 'test-connection.txt', { type: 'text/plain' });

    console.log('📦 Uploading test file...');
    
    // 2. Upload file
    const url = await storageService.uploadFile(file, 'test-folder');
    console.log('✅ Upload successful!');
    console.log('🔗 File URL:', url);

    // 3. Verify URL format
    if (!url.startsWith('https://')) {
        console.warn('⚠️ Warning: URL does not start with https://');
    }

    // 4. Cleanup (Delete the file)
    console.log('🗑️ Cleaning up (deleting file)...');
    await storageService.deleteFile(url);
    console.log('✅ Delete successful!');

    console.log('🎉 MinIO Integration Test Passed!');
  } catch (error) {
    console.error('❌ Test Failed:', error);
    process.exit(1);
  }
}

testMinioConnection();
