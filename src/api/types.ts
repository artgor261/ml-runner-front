/**
 * TypeScript types matching the backend OpenAPI schema (docs/openapi.json).
 * These are hand-maintained to mirror `components.schemas` 1:1.
 */

// ---- Enums ----------------------------------------------------------------

export type DatasetSource = 'moex' | 'gdrive' | 'upload';

export type Executor = 'local' | 'datasphere';

export type RunStatus = 'pending' | 'running' | 'completed' | 'failed' | 'stopped';

// ---- Generic ----------------------------------------------------------------

export interface Message {
  detail: string;
}

export interface ValidationError {
  loc: (string | number)[];
  msg: string;
  type: string;
}

export interface HTTPValidationError {
  detail?: ValidationError[];
}

// ---- Datasets ---------------------------------------------------------------

export interface DatasetRead {
  id: string;
  name: string;
  description: string | null;
  source: DatasetSource;
  path: string;
  tickers: string[];
  interval: number | null;
  start: string | null;
  end: string | null;
  rows: number | null;
  meta: Record<string, unknown>;
  created_at: string;
}

/** A single dataset row (raw candle/feature values). */
export type DatasetRow = Record<string, unknown>;

/** Raw dataset rows keyed by ticker. */
export type DatasetData = Record<string, DatasetRow[]>;

/**
 * DatasetRead enriched with the loaded rows per ticker. Returned by the
 * dataset creation endpoints (POST /datasets/moex, /datasets/gdrive).
 */
export interface DatasetReadWithData extends DatasetRead {
  data: DatasetData;
}

export interface MoexLoadRequest {
  name: string;
  tickers: string[];
  start: string;
  end?: string | null;
  board?: string | null;
  interval?: number | null;
  concurrency?: number | null;
  description?: string | null;
}

export interface GDriveImportRequest {
  name: string;
  gdrive_url: string;
  tickers?: string[] | null;
  description?: string | null;
}

// ---- Training / Runs --------------------------------------------------------

export interface Hyperparams {
  input_chunk_length?: number | null;
  output_chunk_length?: number | null;
  kernel_size?: number | null;
  num_filters?: number | null;
  dilation_base?: number | null;
  num_layers?: number | null;
  lr?: number | null;
  batch_size?: number | null;
  n_epochs?: number | null;
  /** mse | l1 | huber | smoothl1 */
  loss?: string | null;
  /** cpu | gpu */
  device?: string | null;
}

export interface TrainRequest {
  experiment_name: string;
  run_name?: string | null;
  description?: string | null;
  dataset_id?: string | null;
  tickers: string[];
  feature_cols?: string[] | null;
  params?: Hyperparams;
  executor?: Executor;
}

export interface RunMetricPoint {
  epoch: number;
  train_loss: number | null;
  val_loss: number | null;
}

export interface RunRead {
  id: string;
  experiment_id: string;
  name: string;
  description: string | null;
  status: RunStatus;
  executor: Executor;
  dataset_id: string | null;
  tickers: string[];
  feature_cols: string[];
  params: Record<string, unknown>;
  current_epoch: number | null;
  total_epochs: number | null;
  metrics: Record<string, unknown> | null;
  run_dir: string | null;
  model_path: string | null;
  error: string | null;
  started_at: string | null;
  finished_at: string | null;
  created_at: string;
}

export interface RunDetail extends RunRead {
  history: RunMetricPoint[];
}

export interface TrainingStatusDetail {
  id: string;
  name: string;
  status: RunStatus;
  current_epoch: number | null;
  total_epochs: number | null;
  metrics: Record<string, unknown> | null;
  error: string | null;
  history: RunMetricPoint[];
}

// ---- Experiments ------------------------------------------------------------

export interface ExperimentCreate {
  name: string;
  description?: string | null;
}

export interface ExperimentRead {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  run_count: number;
}

export interface ExperimentDetail {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  run_count: number;
  runs: RunRead[];
}

// ---- Models -----------------------------------------------------------------

export interface ModelRead {
  id: string;
  name: string;
  description: string | null;
  path: string;
  framework: string;
  architecture: string | null;
  run_id: string | null;
  params: Record<string, unknown>;
  metrics: Record<string, unknown> | null;
  tickers: string[];
  feature_cols: string[];
  meta: Record<string, unknown>;
  created_at: string;
}

export interface ModelRegisterRequest {
  name: string;
  path: string;
  description?: string | null;
  architecture?: string | null;
  tickers?: string[] | null;
  feature_cols?: string[] | null;
  params?: Record<string, unknown> | null;
  metrics?: Record<string, unknown> | null;
}

export interface ModelUploadRequest {
  name: string;
  description?: string | null;
  file: File;
}

// ---- Validation -------------------------------------------------------------

export interface ValidationRequest {
  model_id?: string | null;
  model_path?: string | null;
  dataset_id?: string | null;
  parquet_dir?: string | null;
  tickers: string[];
  feature_cols?: string[] | null;
  include_predictions?: boolean;
  include_backtest?: boolean;
  backtest_threshold?: number;
}

export interface TickerPrediction {
  index: number[];
  predicted: number[];
  actual: number[];
}

export interface ValidationResponse {
  output_chunk_length: number;
  tickers: string[];
  metrics: Record<string, number | string>;
  date_ranges: Record<string, unknown>;
  predictions?: Record<string, TickerPrediction> | null;
  backtest?: Record<string, unknown> | null;
}

// ---- Health -----------------------------------------------------------------

export interface HealthResponse {
  status?: string;
  [key: string]: unknown;
}
