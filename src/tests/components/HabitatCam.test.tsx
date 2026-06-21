import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { HabitatCam } from '@/components/museum/HabitatCam';
import type { HabitatData } from '@/types';

const mockHabitat: HabitatData = {
  id: 'hab-123',
  name: 'Suburban Commuter Corridor',
  biome: 'Asphalt Savanna',
  temperature: 28.4,
  humidity: 45,
  biodiversityIndex: 0.12,
  threatLevel: 'CRITICALLY_ENDANGERED',
  coordinates: { lat: 40.71, lng: -74.0 },
  description: 'A test description of the habitat.',
};

describe('HabitatCam', () => {
  it('renders habitat details', () => {
    render(<HabitatCam habitat={mockHabitat} />);
    expect(screen.getByText('Suburban Commuter Corridor')).toBeInTheDocument();
    expect(screen.getByText('Asphalt Savanna')).toBeInTheDocument();
    expect(screen.getByText('28.4°C')).toBeInTheDocument();
  });

  it('has proper label and describedby for the upload area', () => {
    render(<HabitatCam habitat={mockHabitat} />);
    const dropzone = screen.getByRole('button', { name: /Upload a photograph of/i });
    expect(dropzone).toHaveAttribute('aria-describedby');
    
    const fileInput = screen.getByLabelText(/Choose image file for/i);
    expect(fileInput).toBeInTheDocument();
    expect(fileInput).toHaveAttribute('type', 'file');
  });

  it('allows keyboard operability of upload', () => {
    render(<HabitatCam habitat={mockHabitat} />);
    const dropzone = screen.getByRole('button', { name: /Upload a photograph of/i });
    
    // Mock the click on the hidden file input
    const fileInput = screen.getByLabelText(/Choose image file for/i);
    const clickSpy = vi.spyOn(fileInput, 'click');
    
    dropzone.focus();
    fireEvent.keyDown(dropzone, { key: 'Enter', code: 'Enter' });
    
    expect(clickSpy).toHaveBeenCalled();
  });

  it('mocks file upload and displays loading state', async () => {
    render(<HabitatCam habitat={mockHabitat} />);
    const fileInput = screen.getByLabelText(/Choose image file for/i);
    
    const file = new File(['dummy content'], 'test.png', { type: 'image/png' });
    
    // Using DataTransfer to mock files
    Object.defineProperty(fileInput, 'files', {
      value: [file]
    });
    
    fireEvent.change(fileInput);
    
    // It should temporarily show uploading
    expect(screen.getByRole('status', { name: 'Uploading photograph' })).toBeInTheDocument();
    
    // And eventually the preview
    await waitFor(() => {
      expect(screen.getByAltText(/Uploaded photograph of the/i)).toBeInTheDocument();
    });
  });
});
