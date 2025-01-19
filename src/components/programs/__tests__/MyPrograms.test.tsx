import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MyPrograms } from '../MyPrograms';
import { programs } from '../../../services/firebase';
import { useUserStore } from '../../../store/userStore';
import { BrowserRouter } from 'react-router-dom';

// Mock Firebase service
vi.mock('../../../services/firebase', () => ({
  programs: {
    getUserPrograms: vi.fn()
  }
}));

// Mock user store
vi.mock('../../../store/userStore', () => ({
  useUserStore: vi.fn()
}));

const mockPrograms = [
  {
    id: '1',
    userId: 'user1',
    programId: 'prog1',
    customizedPlan: 'Test plan 1',
    createdAt: new Date(),
    program: {
      id: 'prog1',
      name: 'Test Program 1',
      description: 'Description 1',
      imageUrl: 'test.jpg',
      template: 'Template 1',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }
];

describe('MyPrograms', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useUserStore as any).mockReturnValue({ user: { id: 'user1' } });
  });

  it('loads and displays programs', async () => {
    (programs.getUserPrograms as any).mockResolvedValue(mockPrograms);

    render(
      <BrowserRouter>
        <MyPrograms />
      </BrowserRouter>
    );

    // Check loading state
    expect(screen.getByText(/loading/i)).toBeInTheDocument();

    // Wait for programs to load
    await waitFor(() => {
      expect(screen.getByText('Test Program 1')).toBeInTheDocument();
    });
  });

  it('handles errors gracefully', async () => {
    (programs.getUserPrograms as any).mockRejectedValue(new Error('Failed to load'));

    render(
      <BrowserRouter>
        <MyPrograms />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/failed to load your programs/i)).toBeInTheDocument();
    });
  });

  it('shows empty state when no programs exist', async () => {
    (programs.getUserPrograms as any).mockResolvedValue([]);

    render(
      <BrowserRouter>
        <MyPrograms />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/no programs yet/i)).toBeInTheDocument();
      expect(screen.getByText(/browse programs/i)).toBeInTheDocument();
    });
  });

  it('opens program details modal when clicking view details', async () => {
    (programs.getUserPrograms as any).mockResolvedValue(mockPrograms);

    render(
      <BrowserRouter>
        <MyPrograms />
      </BrowserRouter>
    );

    await waitFor(() => {
      const viewButton = screen.getByText(/view details/i);
      fireEvent.click(viewButton);
      expect(screen.getByText('Test plan 1')).toBeInTheDocument();
    });
  });
});