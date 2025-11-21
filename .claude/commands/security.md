# /security - Security Audit & Hardening

Deploy the SECURITY TASK FORCE for comprehensive security analysis and hardening.

## Security Audit Protocol

### Phase 1: Threat Surface Analysis 🔍

#### Frontend Security
- [ ] XSS vulnerabilities (unescaped user input)
- [ ] CSRF protection
- [ ] Content Security Policy
- [ ] Secure HTTP headers
- [ ] Third-party scripts
- [ ] localStorage/sessionStorage usage
- [ ] Cookie security (httpOnly, secure, sameSite)

#### Backend Security
- [ ] SQL Injection (if using SQL)
- [ ] Authentication bypasses
- [ ] Authorization checks
- [ ] Rate limiting
- [ ] Input validation
- [ ] Output encoding
- [ ] Error handling (no sensitive data leaks)

#### Dependency Security
- [ ] Known vulnerabilities (`npm audit`)
- [ ] Outdated packages
- [ ] Malicious packages
- [ ] Dependency confusion
- [ ] Abandoned packages

### Phase 2: Secret Scanning 🔐

Scan entire codebase for:

#### Hardcoded Secrets
```bash
# API Keys
grep -r "api_key\|apikey\|API_KEY" --include="*.ts" --include="*.tsx" --include="*.js"

# Passwords
grep -r "password\|pwd\|passwd" --include="*.ts" --include="*.tsx"

# Tokens
grep -r "token\|secret\|key" --include="*.ts" --include="*.tsx"

# AWS credentials
grep -r "AKIA" --include="*.ts" --include="*.tsx"

# Private keys
grep -r "BEGIN.*PRIVATE KEY" --include="*"
```

#### Environment Variables
- [ ] All secrets in .env (not in code)
- [ ] .env in .gitignore
- [ ] .env.example provided (without actual values)
- [ ] Production secrets different from dev

### Phase 3: Vulnerability Scan 🛡️

#### npm Audit
```bash
npm audit
npm audit --json > security-audit.json
```

#### Check for:
- 🔴 **Critical** vulnerabilities (fix immediately)
- 🟡 **High** vulnerabilities (fix within 24h)
- 🟢 **Moderate/Low** (schedule fix)

#### Fix Strategy
```bash
# Automatic fixes (safe)
npm audit fix

# Manual fixes (check breaking changes)
npm audit fix --force

# Alternative: update specific package
npm update package-name
```

### Phase 4: Code Security Review 🔬

#### Dangerous Patterns
```tsx
// ❌ BAD: XSS vulnerable
<div dangerouslySetInnerHTML={{__html: userInput}} />

// ✅ GOOD: React escapes by default
<div>{userInput}</div>

// ❌ BAD: eval is evil
eval(userCode)

// ✅ GOOD: Don't use eval

// ❌ BAD: SQL injection (if using SQL)
`SELECT * FROM users WHERE id = ${userId}`

// ✅ GOOD: Parameterized queries
supabase.from('users').select().eq('id', userId)
```

#### Authentication & Authorization
```tsx
// Check for:
- Proper token validation
- Session management
- Password hashing (bcrypt, argon2)
- MFA implementation
- Rate limiting on auth endpoints
- Secure password reset flow
```

### Phase 5: Supabase RLS Audit 🔒

#### Verify RLS Policies
```sql
-- Check if RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';

-- Verify policies exist
SELECT schemaname, tablename, policyname, cmd, qual
FROM pg_policies
WHERE schemaname = 'public';
```

#### Test RLS
```typescript
// Try to access data without auth
const { data, error } = await supabase
  .from('employees')
  .select()
// Should return error if RLS working

// Try to access other company's data
const { data, error } = await supabase
  .from('employees')
  .select()
  .eq('company_id', 'other-company-id')
// Should return empty if RLS working
```

### Phase 6: Security Headers 📋

#### Required Headers
```typescript
// Express middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('X-XSS-Protection', '1; mode=block')
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  res.setHeader('Content-Security-Policy', "default-src 'self'")
  next()
})
```

### Phase 7: File Upload Security 📎

If app handles file uploads:
- [ ] File type validation (not just extension)
- [ ] File size limits
- [ ] Malware scanning
- [ ] Sanitize filenames
- [ ] Store outside webroot
- [ ] Use signed URLs
- [ ] Scan for embedded scripts

### Phase 8: Logging & Monitoring 📊

#### Security Logging
- [ ] Failed login attempts
- [ ] Privilege escalations
- [ ] Data access patterns
- [ ] API rate limiting triggers
- [ ] Suspicious activities

#### Don't Log
- ❌ Passwords (even hashed)
- ❌ API keys
- ❌ Tokens
- ❌ Credit card numbers
- ❌ Personal identifiable information (PII)

### Phase 9: Production Hardening 🏭

#### Checklist
- [ ] Remove console.log statements
- [ ] Disable source maps in production
- [ ] Enable error reporting (Sentry, etc.)
- [ ] Set up HTTPS (Let's Encrypt)
- [ ] Configure CORS properly
- [ ] Implement rate limiting
- [ ] Set up WAF (Web Application Firewall)
- [ ] Regular security updates
- [ ] Backup strategy
- [ ] Incident response plan

### Phase 10: Security Scorecard 📈

Rate security (0-100):

**Scoring:**
- Authentication: 20 points
- Authorization: 15 points
- Input Validation: 15 points
- Data Encryption: 15 points
- Dependency Security: 10 points
- Headers & CSP: 10 points
- Logging & Monitoring: 10 points
- Incident Response: 5 points

**Target:** > 80 for production

## Immediate Actions Required

Based on findings, create prioritized list:

### 🔴 Critical (Fix Now)
- Exposed secrets
- Critical vulnerabilities
- Missing authentication
- RLS disabled

### 🟡 High (Fix This Week)
- High severity vulnerabilities
- Missing HTTPS
- Weak password policy
- No rate limiting

### 🟢 Medium (Fix This Month)
- Moderate vulnerabilities
- Missing security headers
- Insufficient logging
- No incident response plan

## Security Monitoring Setup

Implement continuous security:
```bash
# Add to package.json scripts
"security:audit": "npm audit",
"security:check": "npm run security:audit && npm outdated",
"precommit": "npm run security:audit"
```

**Leave no vulnerability unpatched. Trust nothing. Verify everything.**
