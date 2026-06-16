import type { ReactNode } from 'react';
import DashboardIcon from '@mui/icons-material/DashboardOutlined';
import StorageIcon from '@mui/icons-material/StorageOutlined';
import ScienceIcon from '@mui/icons-material/ScienceOutlined';
import ModelTrainingIcon from '@mui/icons-material/ModelTrainingOutlined';
import LayersIcon from '@mui/icons-material/LayersOutlined';
import FactCheckIcon from '@mui/icons-material/FactCheckOutlined';

export interface NavItem {
  label: string;
  to: string;
  icon: ReactNode;
  /** Match nested routes (e.g. /datasets/:id) for active highlighting. */
  match: (pathname: string) => boolean;
}

export const NAV_ITEMS: NavItem[] = [
  {
    label: 'Dashboard',
    to: '/',
    icon: <DashboardIcon />,
    match: (p) => p === '/',
  },
  {
    label: 'Datasets',
    to: '/datasets',
    icon: <StorageIcon />,
    match: (p) => p.startsWith('/datasets'),
  },
  {
    label: 'Experiments',
    to: '/experiments',
    icon: <ScienceIcon />,
    match: (p) => p.startsWith('/experiments'),
  },
  {
    label: 'Training',
    to: '/training',
    icon: <ModelTrainingIcon />,
    match: (p) => p.startsWith('/training') || p.startsWith('/runs'),
  },
  {
    label: 'Models',
    to: '/models',
    icon: <LayersIcon />,
    match: (p) => p.startsWith('/models'),
  },
  {
    label: 'Validation',
    to: '/validation',
    icon: <FactCheckIcon />,
    match: (p) => p.startsWith('/validation'),
  },
];
