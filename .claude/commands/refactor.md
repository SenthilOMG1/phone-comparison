# /refactor - Code Refactoring Battalion

Deploy the REFACTORING SPECIALISTS to improve code quality without changing functionality.

## Refactoring Mission Briefing

### Step 1: Target Identification 🎯

Ask user to specify refactoring target:
- Single file/component
- Entire feature/module
- Specific pattern (e.g., "extract hooks from components")
- Code smell (e.g., "reduce component complexity")

### Step 2: Pre-Refactor Analysis 🔍

Before making ANY changes:

#### Safety Checks
- [ ] All tests currently passing
- [ ] No uncommitted changes (or create backup branch)
- [ ] TypeScript compilation successful
- [ ] Build working correctly

#### Code Analysis
- Measure current complexity
- Count lines of code
- Identify dependencies
- List all usages/references
- Check for potential breaking changes

### Step 3: Refactoring Patterns 🛠️

Choose appropriate pattern:

#### Extract Component
```tsx
// Before: One large component (300 lines)
function Dashboard() {
  // User section (100 lines)
  // Stats section (100 lines)
  // Chart section (100 lines)
}

// After: Split into focused components
function Dashboard() {
  return (
    <>
      <UserSection />
      <StatsSection />
      <ChartSection />
    </>
  )
}
```

#### Extract Hook
```tsx
// Before: Logic mixed with UI
function Component() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Complex data fetching logic
  }, [])

  // ... more logic
}

// After: Clean separation
function useDataFetch() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  // Extracted logic
  return { data, loading }
}

function Component() {
  const { data, loading } = useDataFetch()
  // Only UI logic
}
```

#### Extract Utility
```tsx
// Before: Duplicate calculation logic
function ComponentA() {
  const total = items.reduce((sum, item) =>
    sum + (item.price * item.quantity), 0)
}

function ComponentB() {
  const total = items.reduce((sum, item) =>
    sum + (item.price * item.quantity), 0)
}

// After: Shared utility
// utils/calculations.ts
export const calculateTotal = (items) =>
  items.reduce((sum, item) =>
    sum + (item.price * item.quantity), 0)

function ComponentA() {
  const total = calculateTotal(items)
}
```

#### Simplify Conditional
```tsx
// Before: Nested conditionals
if (user) {
  if (user.role === 'admin') {
    if (user.permissions.includes('delete')) {
      return <DeleteButton />
    }
  }
}

// After: Early returns
if (!user) return null
if (user.role !== 'admin') return null
if (!user.permissions.includes('delete')) return null
return <DeleteButton />
```

#### Replace Magic Numbers
```tsx
// Before
if (user.age >= 18 && hours > 40) { }

// After
const LEGAL_ADULT_AGE = 18
const STANDARD_WORK_WEEK = 40

if (user.age >= LEGAL_ADULT_AGE && hours > STANDARD_WORK_WEEK) { }
```

### Step 4: Execution Plan 📋

Create detailed plan:
1. List all files to be modified
2. Order of changes (dependencies first)
3. Test strategy after each change
4. Rollback plan if issues occur

### Step 5: Incremental Implementation ⚡

Refactor in small steps:
1. Make ONE change
2. Run TypeScript check
3. Run tests
4. Commit with descriptive message
5. Repeat

**NEVER** make multiple unrelated changes in one commit.

### Step 6: Post-Refactor Verification ✅

After refactoring:
- [ ] All tests still passing
- [ ] TypeScript compilation successful
- [ ] Build still working
- [ ] No new console errors
- [ ] Functionality unchanged
- [ ] Code more readable
- [ ] Complexity reduced
- [ ] Documentation updated

### Step 7: Metrics Comparison 📊

Compare before/after:
- Lines of code
- Cyclomatic complexity
- Number of components/functions
- Test coverage
- TypeScript errors/warnings

## Refactoring Principles

**DO:**
- ✅ Make code more readable
- ✅ Reduce duplication (DRY)
- ✅ Improve maintainability
- ✅ Follow project patterns
- ✅ Test after each change
- ✅ Commit frequently

**DON'T:**
- ❌ Change functionality
- ❌ Fix bugs during refactoring
- ❌ Add new features
- ❌ Make multiple changes at once
- ❌ Skip tests
- ❌ Refactor without backup

## Red Flags 🚩

Stop immediately if:
- Tests start failing
- TypeScript errors appear
- Build breaks
- Functionality changes
- Scope creeping (doing too much)

**Refactor with surgical precision. Test relentlessly. Improve systematically.**
