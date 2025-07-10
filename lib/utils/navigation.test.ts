import { redirectTo, navigateTo, getQueryParams, getCallbackUrl } from './navigation';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('Navigation utilities', () => {
  let mockRouter: any;

  beforeEach(() => {
    // Reset mocks before each test
    mockRouter = {
      push: vi.fn(),
      replace: vi.fn()
    };

    // Mock window location for tests
    Object.defineProperty(window, 'location', {
      value: {
        search: '?callbackUrl=%2Fdashboard&foo=bar'
      },
      writable: true
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('redirectTo', () => {
    it('should call router.replace with the provided path', () => {
      redirectTo(mockRouter, '/test');
      expect(mockRouter.replace).toHaveBeenCalledWith('/test');
    });

    it('should add callbackUrl as a query parameter when provided', () => {
      redirectTo(mockRouter, '/login', { callbackUrl: '/dashboard' });
      expect(mockRouter.replace).toHaveBeenCalledWith('/login?callbackUrl=%2Fdashboard');
    });
  });

  describe('navigateTo', () => {
    it('should call router.push with the provided path', () => {
      navigateTo(mockRouter, '/test');
      expect(mockRouter.push).toHaveBeenCalledWith('/test');
    });
  });

  describe('getQueryParams', () => {
    it('should return an object with URL query parameters', () => {
      const params = getQueryParams();
      expect(params).toEqual({
        callbackUrl: '/dashboard',
        foo: 'bar'
      });
    });

    it('should return an empty object when window is undefined', () => {
      const originalWindow = global.window;
      // @ts-ignore - Testing when window is undefined
      global.window = undefined;
      
      const params = getQueryParams();
      expect(params).toEqual({});
      
      // Restore window
      global.window = originalWindow;
    });
  });

  describe('getCallbackUrl', () => {
    it('should return the callbackUrl from query parameters if present', () => {
      const url = getCallbackUrl();
      expect(url).toBe('/dashboard');
    });

    it('should return the default path if no callbackUrl is present', () => {
      // Mock window location with no callback
      Object.defineProperty(window, 'location', {
        value: { search: '?foo=bar' },
        writable: true
      });
      
      const url = getCallbackUrl('/home');
      expect(url).toBe('/home');
    });

    it('should use "/" as default path if none provided and no callbackUrl', () => {
      // Mock window location with no callback
      Object.defineProperty(window, 'location', {
        value: { search: '?foo=bar' },
        writable: true
      });
      
      const url = getCallbackUrl();
      expect(url).toBe('/');
    });
  });
});
