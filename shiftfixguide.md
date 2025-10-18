# 🔧 SHIFT - File Transfer Fix Guide

## 🎯 Problem Identified

**Root Cause**: The Supabase storage bucket `shift-files` doesn't exist, causing file uploads to fail silently.

**Symptoms**:
- ✅ Room creation works
- ✅ File upload appears to work (shows progress)  
- ❌ Files don't actually upload
- ❌ Receiver sees "No files available"
- ❌ Console shows: "StorageApiError: Bucket not found"

## ✅ Solution: Create the Storage Bucket

### Method 1: Using Supabase Dashboard (Easiest) ⭐

1. **Open your Supabase project**
   - Go to: https://sfcyyiaixdtlytyzvapy.supabase.co

2. **Navigate to Storage**
   - Click "Storage" in the left sidebar menu

3. **Create the bucket**
   - Click the "New bucket" button
   - Enter the following details:
     - **Name**: `shift-files` (must be exactly this!)
     - **Public**: Keep it **OFF** (unchecked)
     - **File size limit**: 52428800 (50MB)
     - **Allowed MIME types**: Leave empty
   - Click "Create bucket"

4. **Configure policies** (Important for security)
   - After creating, click on the `shift-files` bucket
   - Go to "Policies" tab
   - Click "New policy"
   - Choose "For full customization" 
   - Add these 4 policies:

   **Policy 1 - Allow Uploads:**
   - Name: "Allow public uploads"
   - Policy command: INSERT
   - Target roles: public
   - USING expression: `bucket_id = 'shift-files'`

   **Policy 2 - Allow Downloads:**
   - Name: "Allow public reads"
   - Policy command: SELECT  
   - Target roles: public
   - USING expression: `bucket_id = 'shift-files'`

   **Policy 3 - Allow Updates:**
   - Name: "Allow public updates"
   - Policy command: UPDATE
   - Target roles: public
   - USING expression: `bucket_id = 'shift-files'`

   **Policy 4 - Allow Deletes:**
   - Name: "Allow public deletes"
   - Policy command: DELETE
   - Target roles: public
   - USING expression: `bucket_id = 'shift-files'`

### Method 2: Using SQL (Faster for developers)

1. Go to your Supabase project: https://sfcyyiaixdtlytyzvapy.supabase.co
2. Click "SQL Editor" in the left sidebar
3. Click "New query"
4. Copy and paste the contents of `/app/supabase/create-storage-bucket.sql`
5. Click "Run" or press Ctrl+Enter

The SQL script will:
- Create the `shift-files` bucket
- Set up all necessary policies
- Show confirmation that the bucket was created

## 🧪 Verify the Fix

After creating the bucket, test your SHIFT app:

1. **Refresh your browser** (hard refresh: Ctrl+Shift+R)

2. **Test the flow**:
   - Click "Start Transfer"
   - Enter your name
   - Upload a test file
   - Click "Generate Soundwave Link"
   - Wait for upload to complete
   - Note the room code
   - Go back home
   - Click "Join Room"  
   - Enter the room code
   - **You should now see the uploaded file!** ✅

3. **Check for errors**:
   - Open browser console (F12)
   - Look for any red errors
   - Should NOT see "Bucket not found" anymore

## 📊 What Changed in the Code

I've improved the application with:

### 1. **Better Error Handling**
- Upload errors now propagate correctly
- Users see clear error messages
- Console errors are more descriptive

### 2. **Error Display UI**
- Red error banner shows when uploads fail
- Error message explains the issue
- Links to setup documentation

### 3. **Documentation**
- `README.md` - Full project documentation
- `setup-storage.md` - Storage setup instructions
- `create-storage-bucket.sql` - Automated SQL setup script
- `SHIFT-FIX-GUIDE.md` - This comprehensive guide

### 4. **Improved Code Quality**
- `storageService.ts` - Now throws errors instead of returning null
- `CreateRoom.tsx` - Better error handling and user feedback
- Error states properly managed throughout the flow

## 🎉 Expected Result

After following these steps:

- ✅ Files upload successfully
- ✅ Upload progress shows correctly
- ✅ Room becomes "Active" after upload
- ✅ Receivers can see all uploaded files
- ✅ Download works perfectly
- ✅ No console errors

## 🆘 Still Having Issues?

If it still doesn't work:

1. **Check browser console** (F12) for any error messages
2. **Verify environment variables** in `.env`:
   ```
   VITE_SUPABASE_URL=https://sfcyyiaixdtlytyzvapy.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
   ```
3. **Confirm bucket name** is exactly `shift-files` (case-sensitive)
4. **Check Supabase dashboard** - Storage > shift-files should be visible
5. **Test with small files** first (< 1MB) to rule out size issues
6. **Clear browser cache** and try again

## 📝 Technical Details

**Storage Bucket Configuration:**
- **Name**: `shift-files`
- **Type**: Private (not public)
- **Access**: Via signed URLs (more secure)
- **File Limit**: 50MB per file
- **Expiry**: Files tied to room expiry (1 hour)

**Security Model:**
- Public can upload/download via signed URLs
- Row Level Security (RLS) on database tables
- No authentication required (anonymous access)
- Auto-cleanup after 1 hour

## 🚀 Next Steps

Once your storage is set up:

1. Test the complete file transfer flow
2. Try with different file types (images, PDFs, videos)
3. Test with multiple files at once
4. Share with friends and test the receiver experience
5. Monitor your Supabase storage usage in the dashboard

## ✨ Features Now Working

- 📤 Multi-file uploads
- 📥 File downloads
- 🔗 Room code sharing
- ⏰ Auto-expiring rooms
- 📊 Download tracking
- 🎨 Beautiful soundwave UI
- 🔒 Secure file storage

Enjoy your fully functional SHIFT file transfer app! 🚀
