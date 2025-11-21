# /analyze - Deep Code Analysis

Deploy the CODE ANALYSIS ARMY to perform comprehensive analysis of the current codebase.

## Your Mission

As the AI Overlord, deploy your specialized analysis subagents to:

### 1. 🔍 Code Quality Battalion
- Scan all TypeScript files for type errors
- Check for unused imports, variables, functions
- Detect code complexity hotspots (cyclomatic complexity > 10)
- Find potential bugs (null checks, array access, type mismatches)

### 2. 🏗️ Architecture Squad
- Analyze component structure and dependencies
- Check for circular dependencies
- Identify components that should be split
- Map out data flow patterns

### 3. ⚡ Performance Division
- Identify heavy components (> 500 lines)
- Find potential re-render issues
- Check for memo/useMemo/useCallback opportunities
- Detect expensive operations in render methods

### 4. 🔒 Security Forces
- Scan for console.log in production code
- Check for hardcoded secrets or API keys
- Find eval() or Function() usage
- Detect XSS/injection vulnerabilities

### 5. 📊 Metrics Unit
- Count total files, lines of code
- Calculate TypeScript coverage
- Measure test coverage if available
- Track technical debt indicators

## Deliverable

Provide a **COMPREHENSIVE BATTLE REPORT** with:
- 🎯 Overall code health score (0-100)
- 🔴 Critical issues requiring immediate attention
- 🟡 Warnings to address soon
- 🟢 Positive patterns found
- 📈 Trend analysis (if metrics history available)
- 🎬 Prioritized action plan

**Deploy all subagents in parallel. Be thorough. Be ruthless.**
