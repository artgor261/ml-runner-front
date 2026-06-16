import { lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';

// Route-level code splitting keeps the initial bundle small; the heavy chart
// pages (recharts) are only loaded when visited.
const Dashboard = lazy(() => import('./pages/Dashboard').then((m) => ({ default: m.Dashboard })));
const Datasets = lazy(() => import('./pages/Datasets').then((m) => ({ default: m.Datasets })));
const DatasetDetails = lazy(() =>
  import('./pages/DatasetDetails').then((m) => ({ default: m.DatasetDetails })),
);
const Experiments = lazy(() =>
  import('./pages/Experiments').then((m) => ({ default: m.Experiments })),
);
const ExperimentDetails = lazy(() =>
  import('./pages/ExperimentDetails').then((m) => ({ default: m.ExperimentDetails })),
);
const TrainingRuns = lazy(() =>
  import('./pages/TrainingRuns').then((m) => ({ default: m.TrainingRuns })),
);
const RunDetails = lazy(() => import('./pages/RunDetails').then((m) => ({ default: m.RunDetails })));
const Models = lazy(() => import('./pages/Models').then((m) => ({ default: m.Models })));
const ModelDetails = lazy(() =>
  import('./pages/ModelDetails').then((m) => ({ default: m.ModelDetails })),
);
const Validation = lazy(() =>
  import('./pages/Validation').then((m) => ({ default: m.Validation })),
);
const NotFound = lazy(() => import('./pages/NotFound').then((m) => ({ default: m.NotFound })));

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'datasets', element: <Datasets /> },
      { path: 'datasets/:datasetId', element: <DatasetDetails /> },
      { path: 'experiments', element: <Experiments /> },
      { path: 'experiments/:experimentId', element: <ExperimentDetails /> },
      { path: 'training', element: <TrainingRuns /> },
      // Runs are addressed by id and shared across training/experiments.
      { path: 'runs/:runId', element: <RunDetails /> },
      { path: 'training/runs/:runId', element: <RunDetails /> },
      { path: 'models', element: <Models /> },
      { path: 'models/:modelId', element: <ModelDetails /> },
      { path: 'validation', element: <Validation /> },
      { path: '404', element: <NotFound /> },
      { path: '*', element: <Navigate to="/404" replace /> },
    ],
  },
]);
