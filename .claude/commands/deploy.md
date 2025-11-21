# /deploy - Full Production Deployment

Execute the DEPLOYMENT PROTOCOL with maximum safety and verification.

## Deployment Sequence

### Phase 1: Pre-Flight Checks 🛡️
1. Run full TypeScript type check (`tsc --noEmit`)
2. Run ESLint on all files
3. Check for console.log, debugger statements
4. Verify all tests pass (`npm test`)
5. Check git status (no uncommitted changes)
6. Verify on correct branch
7. Ensure .env.production exists and is valid

### Phase 2: Build & Optimize 🔨
1. Clean previous build (`rm -rf dist`)
2. Run production build (`npm run build`)
3. Analyze bundle sizes
4. Verify no build errors or critical warnings
5. Check dist/ directory created successfully
6. Validate build artifacts

### Phase 3: Version & Tag 🏷️
1. Check current version in package.json
2. Suggest version bump (patch/minor/major)
3. Update package.json version
4. Create git tag with version number
5. Generate changelog from recent commits

### Phase 4: Commit & Push 📤
1. Stage all changes
2. Create deployment commit with standardized message
3. Push to remote
4. Push tags to remote

### Phase 5: Server Deployment 🚀
1. SCP dist/ to server (3.1.78.146:/home/bitnami/mobi-wfm/dist/)
2. Backup current production dist/ on server
3. Copy new dist/ files
4. Restart PM2 processes
5. Verify processes are running
6. Check server logs for errors

### Phase 6: Post-Deployment Verification ✅
1. Wait 30 seconds for app to initialize
2. Check PM2 process status
3. Verify no restart loops
4. Check application logs (pm2 logs --lines 50)
5. Test critical endpoints (health check)
6. Verify bundle loads correctly

### Phase 7: Rollback Plan 🔄
If ANY step fails:
1. Stop immediately
2. Restore backup on server
3. Restart PM2 with backup
4. Document failure reason
5. Create rollback git tag

## Required Information

Before proceeding, confirm:
- [ ] Current version number
- [ ] Target version number
- [ ] SSH key location
- [ ] Server IP and path
- [ ] PM2 process names

## Success Criteria

Deployment is successful ONLY if:
- ✅ All tests pass
- ✅ Build completes without errors
- ✅ Git push succeeds
- ✅ Files transferred to server
- ✅ PM2 processes running and healthy
- ✅ No errors in logs for 60 seconds

**Execute with military precision. One step at a time. Report status after each phase.**
