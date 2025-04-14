// Jest setup file

// Set up DOM environment globals
if (typeof window === "undefined") {
  global.window = {};
}

// Mock browser navigator object with default values
Object.defineProperty(window, "navigator", {
  value: {
    userAgent: "node.js",
    platform: "MacIntel",
    language: "en-US",
    languages: ["en-US", "en"],
    deviceMemory: 8,
  },
  writable: true,
});

// Mock localStorage
if (!window.localStorage) {
  window.localStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  };
}

// Mock sessionStorage
if (!window.sessionStorage) {
  window.sessionStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  };
}

// Add any global test utilities or custom matchers here
