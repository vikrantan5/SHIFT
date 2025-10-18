import { supabase, STORAGE_BUCKET } from './lib/supabase';

/**
 * Verifies if the storage bucket exists and is properly configured
 * Run this to diagnose storage issues
 */
export async function verifyStorageSetup(): Promise<{
  bucketExists: boolean;
  canUpload: boolean;
  canRead: boolean;
  errors: string[];
}> {
  const errors: string[] = [];
  let bucketExists = false;
  let canUpload = false;
  let canRead = false;

  try {
    // Check if bucket exists by listing buckets
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      errors.push(`Failed to list buckets: ${listError.message}`);
    } else {
      bucketExists = buckets?.some(b => b.id === STORAGE_BUCKET) || false;
      
      if (!bucketExists) {
        errors.push(`Storage bucket '${STORAGE_BUCKET}' not found. Please create it in Supabase dashboard.`);
      }
    }

    // Test upload capability (only if bucket exists)
    if (bucketExists) {
      const testFile = new Blob(['test'], { type: 'text/plain' });
      const testPath = `_test/${Date.now()}.txt`;
      
      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(testPath, testFile);

      if (uploadError) {
        errors.push(`Upload test failed: ${uploadError.message}`);
      } else {
        canUpload = true;
        
        // Test read capability
        const { data: urlData, error: urlError } = await supabase.storage
          .from(STORAGE_BUCKET)
          .createSignedUrl(testPath, 60);

        if (urlError) {
          errors.push(`Read test failed: ${urlError.message}`);
        } else {
          canRead = !!urlData?.signedUrl;
        }

        // Clean up test file
        await supabase.storage.from(STORAGE_BUCKET).remove([testPath]);
      }
    }
  } catch (error) {
    errors.push(`Verification error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return {
    bucketExists,
    canUpload,
    canRead,
    errors
  };
}

/**
 * Displays storage setup status in console
 * Call this function to check your storage configuration
 */
export async function checkStorageStatus() {
  console.log('🔍 Checking SHIFT storage configuration...\n');
  
  const status = await verifyStorageSetup();
  
  console.log('Storage Bucket:', status.bucketExists ? '✅ Found' : '❌ Not Found');
  console.log('Upload Capability:', status.canUpload ? '✅ Working' : '❌ Failed');
  console.log('Read Capability:', status.canRead ? '✅ Working' : '❌ Failed');
  
  if (status.errors.length > 0) {
    console.log('\n⚠️ Issues found:');
    status.errors.forEach((error, i) => {
      console.log(`${i + 1}. ${error}`);
    });
    console.log('\n📖 See setup-storage.md for setup instructions.');
  } else {
    console.log('\n✅ Storage is properly configured!');
  }
  
  return status;
}

// Make it available in browser console for debugging
if (typeof window !== 'undefined') {
  (window as any).checkStorageStatus = checkStorageStatus;
  console.log('💡 Run checkStorageStatus() in console to verify storage setup');
}
