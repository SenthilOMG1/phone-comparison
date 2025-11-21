# /optimize - Performance Optimization Blitz

Deploy the PERFORMANCE OPTIMIZATION STRIKE TEAM to make your app blazing fast.

## Optimization Assault Plan

### Phase 1: Performance Audit 📊

#### Bundle Analysis
1. Run `npm run build` and analyze bundle sizes
2. Identify largest chunks (> 500KB uncompressed)
3. Check for duplicate dependencies
4. Look for unnecessary imports

#### Component Analysis
1. Find components > 300 lines (candidates for splitting)
2. Check for missing React.memo()
3. Identify expensive re-renders
4. Look for useEffect dependency issues

#### Asset Analysis
1. Check image sizes (> 100KB should be optimized)
2. Look for uncompressed assets
3. Identify unused fonts
4. Check for missing lazy loading

### Phase 2: Quick Wins ⚡

#### Code Splitting
```tsx
// Convert
import HeavyComponent from './HeavyComponent'

// To
const HeavyComponent = lazy(() => import('./HeavyComponent'))
```

#### Lazy Loading
```tsx
<Suspense fallback={<Spinner />}>
  <LazyComponent />
</Suspense>
```

#### Memoization
```tsx
// Expensive calculations
const result = useMemo(() => heavyCalculation(data), [data])

// Callbacks
const handleClick = useCallback(() => doSomething(id), [id])

// Components
export default React.memo(MyComponent)
```

### Phase 3: Deep Optimizations 🔬

#### Vite Config
```ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-heavy': ['heavy-lib-1', 'heavy-lib-2'],
        },
      },
    },
    chunkSizeWarningLimit: 600,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
      },
    },
  },
})
```

#### Image Optimization
- Use WebP format
- Implement responsive images
- Add lazy loading
- Use CDN for static assets

#### Database Queries
- Add indexes where needed
- Minimize data fetching
- Implement pagination
- Use select() to limit columns

### Phase 4: Metrics Before/After 📈

Measure and compare:
- Initial bundle size (KB)
- Largest chunk size (KB)
- First Contentful Paint (ms)
- Time to Interactive (ms)
- Lighthouse score (0-100)

Target improvements:
- 🎯 Bundle size: -30%
- 🎯 Load time: -40%
- 🎯 Lighthouse: > 90

### Phase 5: Implementation Strategy 🚀

Prioritize by impact:
1. ⚡ **High Impact, Low Effort** - Do immediately
   - Remove unused dependencies
   - Enable gzip/brotli compression
   - Add React.memo to heavy components

2. 🔥 **High Impact, High Effort** - Do next
   - Implement code splitting
   - Lazy load routes
   - Optimize images

3. 💡 **Low Impact, Low Effort** - Do if time allows
   - Clean up console.logs
   - Remove unused code
   - Update old dependencies

4. 📋 **Low Impact, High Effort** - Consider carefully
   - Rewrite heavy algorithms
   - Major refactoring
   - Switch libraries

## Performance Checklist

- [ ] Bundle analysis completed
- [ ] Heavy components identified
- [ ] Code splitting implemented
- [ ] Lazy loading added
- [ ] Images optimized
- [ ] Memoization applied
- [ ] Before/after metrics recorded
- [ ] Lighthouse score improved

**Make it fast. Make it efficient. Leave no performance stone unturned.**
