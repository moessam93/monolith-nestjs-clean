# Environment Switching Made Simple

## 🚀 **Smooth Environment Switching**

No more copy-pasting! Just use these commands:

### **Start Application**
```bash
npm run dev      # 🟢 Development environment
npm run testing  # 🟡 Testing environment  
npm run staging  # 🟠 Staging environment
```

### **Database Migrations**
```bash
npm run migrate:dev      # 🟢 Migrate development DB
npm run migrate:testing  # 🟡 Migrate testing DB
npm run migrate:staging  # 🟠 Migrate staging DB
```

### **Database Studio**
```bash
npm run studio:dev      # 🟢 Open development DB
npm run studio:testing  # 🟡 Open testing DB
npm run studio:staging  # 🟠 Open staging DB
```

## How It Works

- **Automatically switches** to the right `.env` file
- **Runs your command** with the correct database
- **Restores** your original `.env` when done

## Your Environment Files

- `.env.development` - Development database
- `.env.testing` - Testing database  
- `.env.staging` - Staging database

## Examples

```bash
# Start development server
npm run dev

# Run testing migration then start testing server
npm run migrate:testing
npm run testing

# Open testing database in Prisma Studio
npm run studio:testing
```

**That's it! Simple and smooth!** 🎯