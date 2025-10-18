# 🚀 SHIFT - Sound-Powered File Transfer

Transfer Beyond Touch — Powered by Sound & Speed

## 🎯 Quick Fix for File Transfer Issues

If files are not showing up for receivers, the storage bucket needs to be created in Supabase.

### ✅ Create Storage Bucket (Required)

1. **Go to your Supabase Dashboard**
   - URL: https://sfcyyiaixdtlytyzvapy.supabase.co

2. **Navigate to Storage**
   - Click "Storage" in the left sidebar

3. **Create New Bucket**
   - Click "Create a new bucket" or "New Bucket"
   - **Name**: `shift-files` (must be exactly this)
   - **Public bucket**: Toggle **OFF** (keep private for security)
   - **File size limit**: 52428800 (50MB) or your preference
   - **Allowed MIME types**: Leave empty (allows all file types)

4. **Click "Create bucket"**

5. **Set Bucket Policies** (Optional but recommended for security)
   - After creating the bucket, go to "Policies" tab
   - Add these policies for public access:

   ```sql
   -- Allow anyone to upload files
   CREATE POLICY "Public Upload" ON storage.objects
   FOR INSERT WITH CHECK (bucket_id = 'shift-files');

   -- Allow anyone to read files
   CREATE POLICY "Public Read" ON storage.objects
   FOR SELECT USING (bucket_id = 'shift-files');
   ```

### 🧪 Verify Setup

After creating the bucket:

1. Open your browser console (F12)
2. Type: `checkStorageStatus()`
3. You should see: ✅ Storage is properly configured!

## 🛠️ Development Setup

```bash
# Install dependencies
yarn install

# Start development server
yarn dev
```

## 📋 Features

- ✨ Create transfer rooms with unique codes
- 📤 Upload multiple files (any type)
- 🔒 Secure file storage with signed URLs
- ⏰ Auto-expiring rooms (1 hour)
- 📊 Download tracking
- 🎨 Futuristic UI with soundwave visualizations

## 🏗️ Architecture

- **Frontend**: React + TypeScript + Vite
- **Backend**: Supabase (PostgreSQL + Storage)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React

## 🔧 Environment Variables

Required in `.env` file:

```env
VITE_SUPABASE_URL=https://sfcyyiaixdtlytyzvapy.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

## 📖 How It Works

1. **Sender** creates a room and uploads files
2. Room generates a unique 8-character code
3. **Receiver** joins using the room code
4. Receiver can view and download all files
5. Room expires after 1 hour automatically

## 🐛 Troubleshooting

### Files not showing for receivers?
- ✅ Make sure storage bucket `shift-files` exists
- ✅ Run `checkStorageStatus()` in browser console
- ✅ Check browser console for error messages

### Upload fails?
- ✅ Verify .env file has correct credentials
- ✅ Check file size limits (default 50MB)
- ✅ Ensure bucket policies allow uploads

### Room not found?
- ✅ Check if room has expired (1 hour limit)
- ✅ Verify room code is correct (case-sensitive)
- ✅ Ensure database migrations are applied

## 📝 Database Schema

### Tables
- `rooms` - Transfer room metadata
- `files` - File metadata and storage paths

### Storage
- `shift-files` - File storage bucket

## 🚀 Deployment

When deploying to production:

1. Update environment variables with production Supabase URL
2. Ensure storage bucket exists in production
3. Apply database migrations
4. Configure CORS settings in Supabase

## 📄 License

MIT

## 🎨 UI/UX

Featuring a "Neon Cyberwave" theme with:
- Dark gradient backgrounds
- Glowing cyan and purple accents
- Animated soundwave visualizations
- Glassmorphism effects
- Smooth transitions and hover effects
