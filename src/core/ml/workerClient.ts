import type {
  WorkerProcessFrameRequest,
  WorkerResponsePayload,
  LivenessAction,
} from './mlTypes';
import { Result, ok, err } from '../utils/result';
import type { BiometricFailure } from '../errors/failure';
import { logger } from '../utils/logger';

class WorkerClient {
  private worker: Worker | null = null;
  private pendingRequests = new Map<
    string,
    {
      resolve: (value: WorkerResponsePayload) => void;
      reject: (error: Error) => void;
    }
  >();
  private isBusy = false;

  private getWorker(): Worker {
    if (!this.worker) {
      this.worker = new Worker(new URL('./mlWorker.ts', import.meta.url), {
        type: 'module',
      });

      this.worker.onmessage = (event: MessageEvent<WorkerResponsePayload>) => {
        const payload = event.data;
        const pending = this.pendingRequests.get(payload.id);
        if (pending) {
          this.pendingRequests.delete(payload.id);
          this.isBusy = false;
          pending.resolve(payload);
        }
      };

      this.worker.onerror = (error) => {
        logger.error('ML Worker encountered error', error);
        this.isBusy = false;
        for (const [id, pending] of this.pendingRequests) {
          pending.reject(new Error(error.message || 'Worker failure'));
          this.pendingRequests.delete(id);
        }
      };
    }
    return this.worker;
  }

  /**
   * Dispatches a video frame to the worker with zero-copy ImageBitmap transfer.
   * If worker is currently busy, skips to implement latest-frame-wins backpressure.
   */
  async processFrame(
    imageBitmap: ImageBitmap,
    mode: 'FACE_DETECT' | 'LIVENESS' | 'EXTRACT_EMBEDDING',
    requiredAction?: LivenessAction
  ): Promise<Result<WorkerResponsePayload, BiometricFailure>> {
    // Drop frame if previous is still processing (latest-frame-wins backpressure)
    if (this.isBusy) {
      imageBitmap.close();
      return err({
        type: 'BIO_NO_FACE_DETECTED',
        message: 'Worker is processing previous frame; dropping to maintain 15 FPS cadence',
      });
    }

    this.isBusy = true;
    const id = `req_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const worker = this.getWorker();

    const requestPayload: WorkerProcessFrameRequest = {
      id,
      type: 'PROCESS_FRAME',
      imageBitmap,
      mode,
      requiredAction,
    };

    return new Promise((resolve) => {
      this.pendingRequests.set(id, {
        resolve: (payload) => {
          if (!payload.success) {
            resolve(
              err({
                type: 'BIO_NO_FACE_DETECTED',
                message: payload.error || 'Frame processing failed',
              })
            );
          } else {
            resolve(ok(payload));
          }
        },
        reject: (error) => {
          resolve(
            err({
              type: 'BIO_NO_FACE_DETECTED',
              message: error.message,
            })
          );
        },
      });

      // Zero-copy transfer of ImageBitmap
      worker.postMessage(requestPayload, [imageBitmap]);
    });
  }

  terminate(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
      this.pendingRequests.clear();
      this.isBusy = false;
    }
  }
}

export const workerClient = new WorkerClient();
