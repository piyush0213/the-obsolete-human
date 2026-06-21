/**
 * @file SpecimenCard.test.tsx
 * @description Implements tests/components/SpecimenCard.test.tsx for The Obsolete Human Museum.
 */
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SpecimenCard } from '@/components/museum/SpecimenCard';
import type { Specimen } from '@/types';

const mockSpecimen: Specimen = {
  id: 'test-123',
  catalogNumber: 'TOH-123',
  commonName: 'The Manual Driver',
  scientificName: 'Homo conducentis',
  description: 'Test description of the manual driver specimen.',
  conservationStatus: 'ENDANGERED',
  lastObserved: '2024-03-15T00:00:00.000Z',
  habitat: 'Highways',
  carbonFootprint: {
    annualKg: 4600,
    equivalentTrees: 209,
    category: 'TRANSPORT',
    trend: 'DECREASING',
  },
  fieldNotes: [],
  tags: ['transportation', 'fossil-fuel'],
};

describe('SpecimenCard', () => {
  it('renders with mock specimen data', () => {
    render(<SpecimenCard specimen={mockSpecimen} />);
    expect(screen.getByText('The Manual Driver')).toBeInTheDocument();
    expect(screen.getByText('Homo conducentis')).toBeInTheDocument();
    expect(screen.getByText(/Test description/)).toBeInTheDocument();
    expect(screen.getByText('Catalog No. TOH-123')).toBeInTheDocument();
  });

  it('points aria-labelledby to the correct heading element', () => {
    render(<SpecimenCard specimen={mockSpecimen} />);
    const card = screen.getByRole('article', { name: 'The Manual Driver' });
    const heading = screen.getByText('The Manual Driver');
    expect(card).toHaveAttribute('aria-labelledby', heading.id);
  });

  it('announces conservation status properly', () => {
    render(<SpecimenCard specimen={mockSpecimen} />);
    const statusLabel = screen.getByRole('status', {
      name: /Conservation status: Endangered/i,
    });
    expect(statusLabel).toBeInTheDocument();
  });

  it('allows keyboard Enter to open details', () => {
    const handleSelect = vi.fn();
    render(<SpecimenCard specimen={mockSpecimen} onSelect={handleSelect} />);

    const button = screen.getByRole('button', {
      name: /View full classification/i,
    });
    button.focus();
    fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' });

    expect(handleSelect).toHaveBeenCalledWith(mockSpecimen);
  });

  it('ensures all text content and tags are present', () => {
    render(<SpecimenCard specimen={mockSpecimen} />);
    const list = screen.getByRole('list', {
      name: /Specimen classification tags/i,
    });
    expect(list).toBeInTheDocument();
    expect(screen.getByText('transportation')).toBeInTheDocument();
    expect(screen.getByText('fossil-fuel')).toBeInTheDocument();
    expect(screen.getByText(/4,600/)).toBeInTheDocument(); // 4600 formatted
  });
});
