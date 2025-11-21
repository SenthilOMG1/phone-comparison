# /debug - Emergency Debug Protocol

Activate the DEBUG SWAT TEAM for rapid issue diagnosis and resolution.

## Emergency Response Protocol

### 1. 🚨 Issue Triage
Ask user:
- What is the issue? (error message, unexpected behavior, performance problem)
- When did it start? (after which change/commit)
- Can you reproduce it? (always, sometimes, rarely)
- Which environment? (dev, staging, production)
- Any error messages or screenshots?

### 2. 🔍 Evidence Collection
Gather intelligence:
- Check recent git commits (`git log -10 --oneline`)
- Review git diff for uncommitted changes
- Check browser console errors (if web app)
- Examine server logs (`pm2 logs --lines 100`)
- Review build output for warnings
- Check IDE diagnostics
- Look for recent dependency updates

### 3. 🎯 Root Cause Analysis
Deploy specialized debugging agents:

#### Agent A: Error Analyzer
- Parse error messages
- Identify error type (syntax, runtime, logic, network)
- Trace error stack to source
- Check related code context

#### Agent B: Change Detective
- Find what changed recently
- Compare working vs broken state
- Identify likely culprit commits
- Check for related file modifications

#### Agent C: Dependency Investigator
- Check for conflicting package versions
- Look for breaking changes in updates
- Verify peer dependencies
- Check for known issues in dependencies

#### Agent D: Environment Auditor
- Verify environment variables
- Check configuration files
- Validate API endpoints
- Ensure database connectivity

### 4. 🔧 Fix Strategy
Based on findings, propose fixes:
- Quick fix (immediate workaround)
- Proper fix (addresses root cause)
- Preventive measures (avoid future occurrences)

### 5. ✅ Verification
After applying fix:
- Test the specific issue
- Run full test suite
- Check for regression
- Verify in all environments
- Document the fix

## Debug Tools Checklist

Use these tools aggressively:
- `npx tsc --noEmit` - Type errors
- `npm run lint` - Code quality
- `git bisect` - Find bad commit
- `npm ls` - Dependency tree
- `node --inspect` - Node debugger
- Chrome DevTools - Frontend debugging
- `pm2 logs` - Server logs
- `git diff HEAD~5` - Recent changes

## Response Time Targets

- 🔴 **Critical (production down)**: Diagnose in 5 min, fix in 30 min
- 🟡 **High (feature broken)**: Diagnose in 15 min, fix in 2 hours
- 🟢 **Medium (minor issue)**: Diagnose in 30 min, fix in 1 day

**Speed is critical. Accuracy is essential. Deploy all debugging forces NOW.**
