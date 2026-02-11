# S3 File Storage Migration Guide

## Overview

This guide covers migrating existing files from local storage to Amazon S3 (or S3-compatible services) and configuring the application to use S3 for all future uploads.

## Prerequisites

### 1. AWS S3 Configuration

Add the following variables to your `.env` file:

```env
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=your-bucket-name
AWS_URL=https://your-bucket-name.s3.amazonaws.com
AWS_ENDPOINT=  # Optional: for S3-compatible services like DigitalOcean Spaces
AWS_USE_PATH_STYLE_ENDPOINT=false
```

### 2. S3 Bucket Setup

- Create an S3 bucket in your AWS account
- Configure bucket permissions:
  - Set appropriate CORS policies if accessing from frontend
  - Configure ACL policy for public read access (if needed)
  - Enable versioning (recommended)

### 3. Install AWS SDK

The Laravel AWS SDK package should already be installed via composer:

```bash
composer require league/flysystem-aws-s3-v3 "^3.0"
```

## Migration Command

### Before Migration: Clean Up Invalid Paths

It's recommended to clean up invalid or empty file paths before migration:

```bash
# Preview what will be cleaned
php artisan storage:cleanup-invalid-paths --dry-run

# Clean up invalid paths
php artisan storage:cleanup-invalid-paths
```

This command removes or nullifies database entries with invalid paths like:
- Empty strings
- `/storage/` or `/storage` without a filename
- Other malformed paths

### Command Syntax

```bash
php artisan storage:migrate-to-s3 [options]
```

### Options

| Option | Description |
|--------|-------------|
| `--type=all` | Type of files to migrate: `all`, `tasks`, `users`, or `feedback` (default: all) |
| `--dry-run` | Preview what will be migrated without making changes |
| `--force` | Skip confirmation prompt |
| `--delete-local` | Delete local files after successful migration to S3 |

### Examples

#### 1. Preview Migration (Dry Run)

```bash
php artisan storage:migrate-to-s3 --dry-run
```

This will show you what files would be migrated without making any changes.

#### 2. Migrate All Files

```bash
php artisan storage:migrate-to-s3
```

You'll be asked to confirm before proceeding.

#### 3. Migrate Only Task Attachments

```bash
php artisan storage:migrate-to-s3 --type=tasks
```

#### 4. Migrate and Delete Local Files

```bash
php artisan storage:migrate-to-s3 --delete-local
```

⚠️ **Warning**: Only use `--delete-local` after confirming the migration was successful!

#### 5. Force Migration Without Confirmation

```bash
php artisan storage:migrate-to-s3 --force
```

## What Gets Migrated

The migration command handles three types of files:

### 1. Task Attachments
- **Model**: `TaskAttachment`
- **Field**: `url`
- **Folder**: `task-attachments/`
- **Condition**: Only files with `type='file'` (not links)

### 2. User Avatars
- **Model**: `User`
- **Field**: `avatar`
- **Folder**: `avatars/`
- **All user avatars with non-empty paths**

### 3. Feedback Files
- **Model**: `Feedback`
- **Fields**: `screenshot_path` and `images` (array)
- **Folder**: `feedback-screenshots/`
- **Includes both single screenshots and image arrays**

## Migration Process

The command performs the following steps for each file:

1. **Validates** S3 configuration
2. **Checks** if file already on S3 (skips if true)
3. **Verifies** local file exists
4. **Copies** file to S3 with:
   - Same path structure
   - Public visibility
   - Correct content type
5. **Updates** database record with S3 URL
6. **Optionally deletes** local file (if `--delete-local` flag used)
7. **Reports** success/failure for each file

## Post-Migration Changes

### Controller Updates

All file upload controllers have been updated to use S3 by default:

#### TaskAttachmentController
```php
// OLD: Storage on public disk
$path = $file->store('task-attachments', 'public');
$url = '/storage/' . $path;

// NEW: Storage on S3
$path = $file->store('task-attachments', 's3');
$url = Storage::disk('s3')->url($path);
```

#### UserController (Avatar Upload)
```php
// NEW: Uses S3 and handles both S3 and local deletion
$path = $request->file('avatar')->store('avatars', 's3');
$url = Storage::disk('s3')->url($path);
```

#### FeedbackController
```php
// NEW: Stores feedback screenshots on S3
$path = $request->file('screenshot')->store('feedback-screenshots', 's3');
$url = Storage::disk('s3')->url($path);
```

## Verification

### 1. Check Migration Results

The command provides a summary:

```
═══════════════════════════════════════
           Migration Summary           
═══════════════════════════════════════
  ✅ Successful: 142
  ⏭️  Skipped: 8
  ❌ Errors: 0
═══════════════════════════════════════
```

### 2. Verify Files in S3

Check your S3 bucket to confirm files are present:

```bash
# Using AWS CLI
aws s3 ls s3://your-bucket-name/task-attachments/
aws s3 ls s3://your-bucket-name/avatars/
aws s3 ls s3://your-bucket-name/feedback-screenshots/
```

### 3. Test File Access

- Try downloading a task attachment
- Upload a new avatar and verify it goes to S3
- Create a new task with files attached

### 4. Check Database URLs

```sql
-- Check task attachments
SELECT id, name, url FROM task_attachments WHERE type = 'file' LIMIT 10;

-- Check user avatars
SELECT id, name, avatar FROM users WHERE avatar IS NOT NULL LIMIT 10;

-- Check feedback screenshots
SELECT id, screenshot_path FROM feedback WHERE screenshot_path IS NOT NULL LIMIT 10;
```

URLs should now point to your S3 domain:
- `https://your-bucket.s3.amazonaws.com/avatars/filename.jpg`
- Not: `/storage/avatars/filename.jpg`

## Rollback Plan

If you need to rollback before deleting local files:

### 1. Revert Controller Changes

```bash
git checkout HEAD -- app/Http/Controllers/Api/TaskAttachmentController.php
git checkout HEAD -- app/Http/Controllers/Api/UserController.php
git checkout HEAD -- app/Http/Controllers/Api/FeedbackController.php
```

### 2. Update Database URLs Back to Local

```sql
-- Revert task attachments
UPDATE task_attachments 
SET url = REPLACE(url, 'https://your-bucket.s3.amazonaws.com/', '/storage/')
WHERE url LIKE '%s3.amazonaws.com%';

-- Revert user avatars
UPDATE users 
SET avatar = REPLACE(avatar, 'https://your-bucket.s3.amazonaws.com/', '/storage/')
WHERE avatar LIKE '%s3.amazonaws.com%';

-- Revert feedback screenshots
UPDATE feedback 
SET screenshot_path = REPLACE(screenshot_path, 'https://your-bucket.s3.amazonaws.com/', '/storage/')
WHERE screenshot_path LIKE '%s3.amazonaws.com%';
```

## Troubleshooting

### Error: "Missing S3 configuration variables"

**Solution**: Add all required AWS_* variables to `.env` file

### Error: "Failed to connect to S3"

**Solutions**:
- Verify AWS credentials are correct
- Check AWS_DEFAULT_REGION matches your bucket region
- Test connection: `aws s3 ls s3://your-bucket-name/`
- Check IAM permissions include `s3:PutObject`, `s3:GetObject`, `s3:DeleteObject`

### Error: "Local file not found"

**Possible causes**:
- File was already deleted
- Path in database is incorrect
- Storage link not created

**Solution**: Check if file exists:
```bash
ls -la storage/app/public/task-attachments/
```

### Files not accessible after migration

**Solutions**:
- Verify S3 bucket policy allows public read
- Check CORS configuration if accessing from frontend
- Ensure files have public visibility: check S3 object ACL

### Some files skipped during migration

Files are skipped if:
- Already on S3 (URL contains S3 domain)
- Invalid or empty paths (e.g., `/storage/` without a filename)
- This is normal for files already migrated or with data quality issues

To clean up invalid paths before migration:
```bash
php artisan storage:cleanup-invalid-paths
```

## Best Practices

### Recommended Migration Workflow

Follow this workflow for a smooth migration:

```bash
# 1. Backup your database first
php artisan backup:run

# 2. Clean up invalid file paths
php artisan storage:cleanup-invalid-paths --dry-run
php artisan storage:cleanup-invalid-paths

# 3. Preview the migration
php artisan storage:migrate-to-s3 --dry-run

# 4. Run the actual migration
php artisan storage:migrate-to-s3

# 5. Verify files are accessible
# Test downloading attachments, viewing avatars, etc.

# 6. After verification (optional), delete local files
php artisan storage:migrate-to-s3 --delete-local --force
```

### General Best Practices

1. **Always run dry-run first**: `--dry-run` flag shows what will happen
2. **Backup database**: Before migration, backup your database
3. **Keep local files**: Don't use `--delete-local` until you've verified everything works
4. **Test in staging**: Run migration in staging environment first
5. **Monitor costs**: S3 storage has costs - monitor usage in AWS console
6. **Set lifecycle policies**: Configure S3 lifecycle rules to manage old files

## Cost Optimization

### S3 Lifecycle Rules

Consider setting up lifecycle policies to reduce costs:

```json
{
  "Rules": [
    {
      "Id": "Move old feedback to Glacier",
      "Status": "Enabled",
      "Prefix": "feedback-screenshots/",
      "Transitions": [
        {
          "Days": 90,
          "StorageClass": "GLACIER"
        }
      ]
    }
  ]
}
```

### CloudFront CDN

For frequently accessed files, consider using CloudFront:
- Reduces S3 data transfer costs
- Improves file loading speed globally
- Update `AWS_URL` to CloudFront distribution URL

## Support

For issues or questions:
1. Check Laravel logs: `storage/logs/laravel.log`
2. Enable debug mode: `APP_DEBUG=true` in `.env`
3. Review AWS CloudWatch logs
4. Check this documentation: `S3_MIGRATION_GUIDE.md`

## Additional Resources

- [Laravel File Storage Documentation](https://laravel.com/docs/11.x/filesystem)
- [AWS S3 Documentation](https://docs.aws.amazon.com/s3/)
- [Laravel Flysystem S3](https://flysystem.thephpleague.com/docs/adapter/aws-s3/)
