# Optimization Guide

This document outlines the optimization strategies implemented in the Chess Learning App.

## Bundle Size Optimization

### Metro Configuration

The app uses a custom Metro configuration (`metro.config.js`) with the following optimizations:

1. **Tree Shaking**: Removes unused code from the bundle
2. **Minification**: Uses Terser for aggressive code minification
3. **Console Removal**: Removes `console.log` statements in production
4. **Dead Code Elimination**: Removes unreachable code
5. **Variable Mangling**: Shortens variable names for smaller bundle size

### Bundle Analysis

To analyze bundle size:

```bash
# Generate bundle stats
npx expo export --platform ios --output-dir dist
npx expo export --platform android --output-dir dist

# Analyze bundle composition
npx react-native-bundle-visualizer
```

### Recommended Actions

1. **Remove unused dependencies**:
   ```bash
   npm install -g depcheck
   depcheck
   ```

2. **Use selective imports**:
   ```typescript
   // ❌ Bad: Imports entire library
   import _ from 'lodash';

   // ✅ Good: Imports only needed function
   import debounce from 'lodash/debounce';
   ```

3. **Analyze with source-map-explorer**:
   ```bash
   npm install -g source-map-explorer
   source-map-explorer dist/bundles/*.js
   ```

## Code Splitting

### Route-Based Splitting

The app implements route-based code splitting using `LazyRoutes.tsx`:

- Each screen is lazy loaded only when navigated to
- Critical screens can be preloaded for better UX
- Three priority levels: high, medium, low

### Usage

```typescript
import { PlayScreen, PuzzleScreen } from '../navigation/LazyRoutes';

// Preload critical screens after app launch
import { preloadCriticalScreens } from '../navigation/LazyRoutes';
preloadCriticalScreens();
```

### Adding New Lazy Routes

```typescript
// In LazyRoutes.tsx
export const NewScreen = lazyLoadScreen(
  () => import('../screens/NewScreen'),
  'NewScreen'
);
```

## Lazy Loading

### Component Lazy Loading

Use the `lazyLoad` utility for heavy components:

```typescript
import { lazyLoad } from '../utils/lazyLoad';

const HeavyComponent = lazyLoad(
  () => import('../components/HeavyComponent')
);

function MyScreen() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <HeavyComponent />
    </Suspense>
  );
}
```

### List Item Lazy Loading

For long lists, use intersection observer:

```typescript
import { useLazyListItem } from '../utils/lazyLoad';

function ListItem({ data }) {
  const ref = useRef();
  const isVisible = useLazyListItem(ref, () => {
    console.log('Item is visible');
  });

  return <View ref={ref}>{isVisible && <Content />}</View>;
}
```

### Preloading

Preload components before they're needed:

```typescript
import { preloadComponent } from '../utils/lazyLoad';

// Preload on user interaction
const handleHover = () => {
  preloadComponent(HeavyComponent);
};
```

## Image Optimization

### Using the Image Optimization Utility

```typescript
import { optimizeImage, preloadImages } from '../utils/imageOptimization';

// Optimize a single image
const optimizedUri = await optimizeImage(originalUri, {
  width: 800,
  height: 600,
  quality: 0.8,
  format: 'jpeg',
  cache: true,
});

// Preload images
await preloadImages([
  'https://example.com/image1.jpg',
  'https://example.com/image2.jpg',
]);
```

### Responsive Images

```typescript
import { getResponsiveImageSource } from '../utils/imageOptimization';

const sources = [
  { uri: 'image-small.jpg', width: 400, height: 300 },
  { uri: 'image-medium.jpg', width: 800, height: 600 },
  { uri: 'image-large.jpg', width: 1600, height: 1200 },
];

const uri = getResponsiveImageSource(sources, screenWidth);
```

### WebP Support

WebP images are supported on Android:

```typescript
import { convertToWebP } from '../utils/imageOptimization';

// Convert to WebP (Android only)
const webpUri = await convertToWebP(originalUri);
```

### Image Caching

Images are automatically cached:

```typescript
import { imageCacheManager } from '../utils/imageOptimization';

// Clear cache
await imageCacheManager.clearCache();

// Get cache size
const size = await imageCacheManager.getCacheSize();
console.log(`Cache size: ${(size / 1024 / 1024).toFixed(2)} MB`);
```

## Performance Monitoring

### Tracking Performance

```typescript
import { performanceService } from '../services/monitoring/performanceService';

// Track screen render performance
performanceService.startRenderTracking('HomeScreen');
// ... render logic
performanceService.endRenderTracking('HomeScreen');

// Track network request
const requestId = 'req-123';
performanceService.startNetworkRequest(requestId, url, 'GET');
// ... make request
performanceService.endNetworkRequest(requestId, url, 'GET', 200, 1024);

// Track custom metric
performanceService.mark('custom_operation', 150, 'ms');
```

### Performance Reports

```typescript
const report = performanceService.generateReport();
console.log(report.summary);
console.log(report.recommendations);
```

## Best Practices

### 1. Component Optimization

```typescript
// Use React.memo for expensive components
const ExpensiveComponent = React.memo(({ data }) => {
  return <View>{/* render logic */}</View>;
});

// Use useMemo for expensive calculations
const result = useMemo(() => {
  return expensiveCalculation(data);
}, [data]);

// Use useCallback for callbacks
const handlePress = useCallback(() => {
  // handle press
}, []);
```

### 2. List Optimization

```typescript
// Use FlatList with optimization props
<FlatList
  data={items}
  renderItem={renderItem}
  keyExtractor={item => item.id}
  initialNumToRender={10}
  maxToRenderPerBatch={10}
  windowSize={5}
  removeClippedSubviews={true}
  getItemLayout={(data, index) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  })}
/>
```

### 3. Avoid Inline Functions

```typescript
// ❌ Bad: Creates new function on every render
<Button onPress={() => handlePress(item)} />

// ✅ Good: Use useCallback
const handleItemPress = useCallback(() => handlePress(item), [item]);
<Button onPress={handleItemPress} />
```

### 4. Optimize Re-renders

```typescript
// Use React DevTools Profiler to identify slow renders
// Enable in development:
import { enableScreens } from 'react-native-screens';
enableScreens();
```

## Measuring Impact

### Before Optimization

Run benchmarks before optimization:

```bash
# Measure bundle size
npx expo export --platform android
ls -lh dist/bundles/

# Measure app performance
npx react-native run-android --variant=release
# Use Flipper or React DevTools Profiler
```

### After Optimization

Compare results:

- Bundle size reduction: Target 20-30% reduction
- Initial load time: Target <2s on mid-range devices
- Screen transition time: Target <300ms
- Memory usage: Monitor for leaks

## Continuous Optimization

1. **Monitor Performance**:
   - Use Analytics Dashboard to track performance metrics
   - Set up alerts for performance regressions

2. **Regular Audits**:
   - Weekly bundle size checks
   - Monthly performance reviews
   - Quarterly dependency audits

3. **A/B Testing**:
   - Test optimization impact on user engagement
   - Measure crash rates after optimizations
   - Track user satisfaction metrics

## Common Issues

### Large Bundle Size

**Problem**: Bundle size exceeds 50MB

**Solutions**:
- Remove unused dependencies
- Implement more aggressive code splitting
- Use dynamic imports for rarely used features
- Optimize images and assets

### Slow Screen Transitions

**Problem**: Screen transitions take >500ms

**Solutions**:
- Lazy load heavy components
- Use React.memo to prevent unnecessary re-renders
- Simplify initial render
- Defer non-critical operations with InteractionManager

### High Memory Usage

**Problem**: App uses >200MB RAM

**Solutions**:
- Clear image cache periodically
- Remove event listeners in useEffect cleanup
- Avoid storing large objects in state
- Use FlatList instead of ScrollView for long lists

## Resources

- [React Native Performance](https://reactnative.dev/docs/performance)
- [Expo Optimization](https://docs.expo.dev/guides/analyzing-bundles/)
- [Metro Bundler](https://facebook.github.io/metro/)
- [React DevTools Profiler](https://reactjs.org/blog/2018/09/10/introducing-the-react-profiler.html)
