# MongoDB Atlas Setup Guide

## Your Connection String Format

Your MongoDB Atlas connection string should look like this:

```
mongodb+srv://Jugal:YOUR_ACTUAL_PASSWORD@cluster0.jf5xddo.mongodb.net/bytecopied?retryWrites=true&w=majority
```

## Steps to Fix:

### 1. Replace `<db_password>` with your actual password
   - The `<db_password>` is a placeholder
   - Replace it with the password you created for your MongoDB Atlas database user

### 2. Add database name
   - Add `/bytecopied` before the `?` in the connection string
   - This tells MongoDB which database to use

### 3. Complete Connection String Format:
```
mongodb+srv://Jugal:YOUR_PASSWORD@cluster0.jf5xddo.mongodb.net/bytecopied?retryWrites=true&w=majority
```

## Example:
If your password is `MyPassword123`, your connection string should be:
```
mongodb+srv://Jugal:MyPassword123@cluster0.jf5xddo.mongodb.net/bytecopied?retryWrites=true&w=majority
```

## Important Notes:

1. **No spaces** in the connection string
2. **Replace `<db_password>`** with your actual password
3. **Add `/bytecopied`** before the `?` to specify the database name
4. **Special characters in password**: If your password has special characters like `@`, `#`, `%`, etc., you need to URL-encode them:
   - `@` becomes `%40`
   - `#` becomes `%23`
   - `%` becomes `%25`
   - etc.

## Your server/.env file should look like:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://Jugal:YOUR_ACTUAL_PASSWORD@cluster0.jf5xddo.mongodb.net/bytecopied?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=7d
```

## If you forgot your password:

1. Go to MongoDB Atlas dashboard
2. Click "Database Access" in the left menu
3. Find your user "Jugal"
4. Click "Edit" → "Edit Password"
5. Set a new password
6. Update your connection string with the new password

## Network Access (Important!):

Make sure your IP is whitelisted:
1. Go to MongoDB Atlas dashboard
2. Click "Network Access" in the left menu
3. Click "Add IP Address"
4. Click "Allow Access from Anywhere" (0.0.0.0/0) for development
5. Or add your specific IP address

