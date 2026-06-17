import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { SecurityTimelineView, TimelineEvent } from './SecurityTimelineView';

const mockEvents: TimelineEvent[] = [
  {
    id: 'tel-001',
    timestamp: '2026-06-17T14:00:00Z',
    severity: 'critical',
    group: 'Contract',
    title: 'Unauthorized Admin Change',
    description: 'set_admin called by non-owner on Vault Contract',
    chain: 'Soroban',
  },
  {
    id: 'tel-002',
    timestamp: '2026-06-17T12:00:00Z',
    severity: 'high',
    group: 'Network',
    title: 'Liquidity Drain Detected',
    description: '25% of liquidity transferred within 60 seconds',
    chain: 'Polygon',
  },
  {
    id: 'tel-003',
    timestamp: '2026-06-17T10:00:00Z',
    severity: 'low',
    group: 'Authentication',
    title: 'Login Anomaly',
    description: 'Unusual login pattern detected',
    chain: 'Ethereum',
  },
];

describe('SecurityTimelineView', () => {
  it('renders without crashing', () => {
    render(<SecurityTimelineView events={mockEvents} />);
  });

  it('shows the heading', () => {
    render(<SecurityTimelineView events={mockEvents} />);
    expect(screen.getByRole('heading', { name: /security timeline/i })).toBeInTheDocument();
  });

  it('renders all events by default', () => {
    render(<SecurityTimelineView events={mockEvents} />);
    expect(screen.getByText('Unauthorized Admin Change')).toBeInTheDocument();
    expect(screen.getByText('Liquidity Drain Detected')).toBeInTheDocument();
    expect(screen.getByText('Login Anomaly')).toBeInTheDocument();
  });

  it('events are ordered newest first', () => {
    render(<SecurityTimelineView events={mockEvents} />);
    const titles = screen
      .getAllByRole('listitem')
      .map(li => li.textContent ?? '')
      .filter(t => t.includes('Change') || t.includes('Drain') || t.includes('Anomaly'));
    expect(titles[0]).toContain('Unauthorized Admin Change');
    expect(titles[1]).toContain('Liquidity Drain Detected');
    expect(titles[2]).toContain('Login Anomaly');
  });

  it('filters by severity', async () => {
    render(<SecurityTimelineView events={mockEvents} />);
    await userEvent.selectOptions(screen.getByLabelText(/severity/i), 'critical');
    expect(screen.getByText('Unauthorized Admin Change')).toBeInTheDocument();
    expect(screen.queryByText('Liquidity Drain Detected')).not.toBeInTheDocument();
    expect(screen.queryByText('Login Anomaly')).not.toBeInTheDocument();
  });

  it('filters by group', async () => {
    render(<SecurityTimelineView events={mockEvents} />);
    await userEvent.selectOptions(screen.getByLabelText(/group/i), 'Network');
    expect(screen.getByText('Liquidity Drain Detected')).toBeInTheDocument();
    expect(screen.queryByText('Unauthorized Admin Change')).not.toBeInTheDocument();
  });

  it('shows empty state when no events match filters', async () => {
    render(<SecurityTimelineView events={mockEvents} />);
    await userEvent.selectOptions(screen.getByLabelText(/severity/i), 'medium');
    expect(screen.getByText(/no events match/i)).toBeInTheDocument();
  });

  it('renders severity badges', () => {
    render(<SecurityTimelineView events={mockEvents} />);
    expect(screen.getByText('critical')).toBeInTheDocument();
    expect(screen.getByText('high')).toBeInTheDocument();
    expect(screen.getByText('low')).toBeInTheDocument();
  });

  it('renders group badges', () => {
    render(<SecurityTimelineView events={mockEvents} />);
    expect(screen.getByText('Contract')).toBeInTheDocument();
    expect(screen.getByText('Network')).toBeInTheDocument();
    expect(screen.getByText('Authentication')).toBeInTheDocument();
  });

  it('renders chain info', () => {
    render(<SecurityTimelineView events={mockEvents} />);
    expect(screen.getByText('Soroban')).toBeInTheDocument();
    expect(screen.getByText('Polygon')).toBeInTheDocument();
  });

  it('renders with default mock data when no events prop provided', () => {
    render(<SecurityTimelineView />);
    expect(screen.getByRole('heading', { name: /security timeline/i })).toBeInTheDocument();
  });
});