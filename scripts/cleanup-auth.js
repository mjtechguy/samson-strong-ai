#!/usr/bin/env node

// Script to clean up auth state during development
const clearAuthState = () => {
  // Clear localStorage
  for (const key of Object.keys(localStorage)) {
    if (key.startsWith('sb-') || key.includes('supabase')) {
      localStorage.removeItem(key);
    }
  }

  // Clear sessionStorage
  for (const key of Object.keys(sessionStorage)) {
    if (key.startsWith('sb-') || key.includes('supabase')) {
      sessionStorage.removeItem(key);
    }
  }

  // Clear cookies
  document.cookie.split(';').forEach(cookie => {
    const name = cookie.split('=')[0].trim();
    if (name.startsWith('sb-') || name.includes('supabase')) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    }
  });

  console.log('Auth state cleared');
};

// Run cleanup
clearAuthState();