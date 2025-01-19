import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock window.URL.createObjectURL
window.URL.createObjectURL = vi.fn();

// Mock window.URL.revokeObjectURL
window.URL.revokeObjectURL = vi.fn();

// Mock ResizeObserver
window.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock IntersectionObserver
window.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));