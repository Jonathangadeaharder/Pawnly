/**
 * Image Optimization Utilities
 *
 * Provides utilities for optimizing images in the app.
 * Features:
 * - Responsive image loading
 * - Image caching
 * - Format conversion (WebP support)
 * - Lazy image loading
 * - Image compression
 */

import { Image, Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

export interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number; // 0-1
  format?: 'jpeg' | 'png' | 'webp';
  cache?: boolean;
}

export interface ResponsiveImageSource {
  uri: string;
  width: number;
  height: number;
}

/**
 * Image cache manager
 */
class ImageCacheManager {
  private cache: Map<string, string> = new Map();
  private cacheDir: string = `${FileSystem.cacheDirectory}images/`;

  async initialize(): Promise<void> {
    try {
      const dirInfo = await FileSystem.getInfoAsync(this.cacheDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(this.cacheDir, { intermediates: true });
      }
    } catch (error) {
      console.error('[ImageCache] Failed to initialize:', error);
    }
  }

  /**
   * Get cached image path
   */
  getCachedPath(uri: string): string | null {
    return this.cache.get(uri) || null;
  }

  /**
   * Cache an image
   */
  async cacheImage(uri: string, localPath: string): Promise<void> {
    this.cache.set(uri, localPath);
  }

  /**
   * Clear cache
   */
  async clearCache(): Promise<void> {
    try {
      await FileSystem.deleteAsync(this.cacheDir, { idempotent: true });
      await FileSystem.makeDirectoryAsync(this.cacheDir, { intermediates: true });
      this.cache.clear();
    } catch (error) {
      console.error('[ImageCache] Failed to clear cache:', error);
    }
  }

  /**
   * Get cache size
   */
  async getCacheSize(): Promise<number> {
    try {
      const files = await FileSystem.readDirectoryAsync(this.cacheDir);
      let totalSize = 0;

      for (const file of files) {
        const fileInfo = await FileSystem.getInfoAsync(`${this.cacheDir}${file}`);
        if (fileInfo.exists && 'size' in fileInfo) {
          totalSize += fileInfo.size;
        }
      }

      return totalSize;
    } catch (error) {
      console.error('[ImageCache] Failed to get cache size:', error);
      return 0;
    }
  }
}

export const imageCacheManager = new ImageCacheManager();

/**
 * Optimize an image
 */
export async function optimizeImage(
  uri: string,
  options: ImageOptimizationOptions = {}
): Promise<string> {
  const {
    width,
    height,
    quality = 0.8,
    format = 'jpeg',
    cache = true,
  } = options;

  try {
    // Check cache first
    if (cache) {
      const cached = imageCacheManager.getCachedPath(uri);
      if (cached) {
        return cached;
      }
    }

    // Determine save format
    let saveFormat: SaveFormat = SaveFormat.JPEG;
    if (format === 'png') {
      saveFormat = SaveFormat.PNG;
    } else if (format === 'webp' && Platform.OS === 'android') {
      // WebP only supported on Android
      saveFormat = SaveFormat.WEBP;
    }

    // Optimize image
    const result = await manipulateAsync(
      uri,
      [
        ...(width || height
          ? [{ resize: { width, height } }]
          : []),
      ],
      {
        compress: quality,
        format: saveFormat,
      }
    );

    // Cache the result
    if (cache) {
      await imageCacheManager.cacheImage(uri, result.uri);
    }

    return result.uri;
  } catch (error) {
    console.error('[ImageOptimization] Failed to optimize image:', error);
    return uri; // Return original on error
  }
}

/**
 * Preload images into memory
 */
export async function preloadImages(uris: string[]): Promise<void> {
  try {
    const promises = uris.map(uri =>
      Image.prefetch(uri).catch(err => {
        console.warn(`[ImageOptimization] Failed to preload ${uri}:`, err);
      })
    );
    await Promise.all(promises);
  } catch (error) {
    console.error('[ImageOptimization] Failed to preload images:', error);
  }
}

/**
 * Get responsive image source based on screen width
 */
export function getResponsiveImageSource(
  sources: ResponsiveImageSource[],
  screenWidth: number
): string {
  // Sort sources by width
  const sorted = [...sources].sort((a, b) => a.width - b.width);

  // Find the smallest image that's larger than the screen width
  const match = sorted.find(source => source.width >= screenWidth);

  // If no match, use the largest available
  return match?.uri || sorted[sorted.length - 1].uri;
}

/**
 * Calculate optimal image dimensions maintaining aspect ratio
 */
export function calculateOptimalDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  const aspectRatio = originalWidth / originalHeight;

  let width = originalWidth;
  let height = originalHeight;

  // Scale down if needed
  if (width > maxWidth) {
    width = maxWidth;
    height = width / aspectRatio;
  }

  if (height > maxHeight) {
    height = maxHeight;
    width = height * aspectRatio;
  }

  return {
    width: Math.round(width),
    height: Math.round(height),
  };
}

/**
 * Compress image file
 */
export async function compressImage(
  uri: string,
  quality: number = 0.7
): Promise<string> {
  return optimizeImage(uri, { quality, format: 'jpeg' });
}

/**
 * Convert image to WebP (Android only)
 */
export async function convertToWebP(uri: string): Promise<string | null> {
  if (Platform.OS !== 'android') {
    console.warn('[ImageOptimization] WebP only supported on Android');
    return null;
  }

  return optimizeImage(uri, { format: 'webp', quality: 0.8 });
}

/**
 * Batch optimize images
 */
export async function batchOptimizeImages(
  uris: string[],
  options: ImageOptimizationOptions = {}
): Promise<string[]> {
  const results: string[] = [];

  for (const uri of uris) {
    try {
      const optimized = await optimizeImage(uri, options);
      results.push(optimized);
    } catch (error) {
      console.error(`[ImageOptimization] Failed to optimize ${uri}:`, error);
      results.push(uri); // Keep original on error
    }
  }

  return results;
}

/**
 * Get image dimensions
 */
export async function getImageDimensions(
  uri: string
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    Image.getSize(
      uri,
      (width, height) => resolve({ width, height }),
      error => reject(error)
    );
  });
}

/**
 * Check if image exists in cache
 */
export async function isImageCached(uri: string): Promise<boolean> {
  const cached = imageCacheManager.getCachedPath(uri);
  if (!cached) return false;

  try {
    const info = await FileSystem.getInfoAsync(cached);
    return info.exists;
  } catch {
    return false;
  }
}

/**
 * Create thumbnail from image
 */
export async function createThumbnail(
  uri: string,
  size: number = 200
): Promise<string> {
  return optimizeImage(uri, {
    width: size,
    height: size,
    quality: 0.6,
    format: 'jpeg',
    cache: true,
  });
}

/**
 * Get estimated image file size
 */
export async function getImageFileSize(uri: string): Promise<number> {
  try {
    const info = await FileSystem.getInfoAsync(uri);
    if (info.exists && 'size' in info) {
      return info.size;
    }
    return 0;
  } catch (error) {
    console.error('[ImageOptimization] Failed to get file size:', error);
    return 0;
  }
}

/**
 * Image optimization statistics
 */
export interface ImageOptimizationStats {
  originalSize: number;
  optimizedSize: number;
  savings: number;
  savingsPercentage: number;
}

/**
 * Get optimization statistics
 */
export async function getOptimizationStats(
  originalUri: string,
  optimizedUri: string
): Promise<ImageOptimizationStats> {
  const originalSize = await getImageFileSize(originalUri);
  const optimizedSize = await getImageFileSize(optimizedUri);
  const savings = originalSize - optimizedSize;
  const savingsPercentage = originalSize > 0 ? (savings / originalSize) * 100 : 0;

  return {
    originalSize,
    optimizedSize,
    savings,
    savingsPercentage,
  };
}

/**
 * Initialize image optimization
 */
export async function initializeImageOptimization(): Promise<void> {
  await imageCacheManager.initialize();
  console.log('[ImageOptimization] Initialized');
}
