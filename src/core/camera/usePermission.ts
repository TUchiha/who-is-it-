import { useState, useEffect, useCallback } from 'react';
import type { CameraPermissionState } from './cameraTypes';
import { cameraService } from './cameraService';
import { logger } from '../utils/logger';

export interface UsePermissionReturn {
  readonly status: CameraPermissionState;
  readonly isGranted: boolean;
  readonly isDenied: boolean;
  readonly requestPermission: () => Promise<boolean>;
  readonly helpText: string;
}

export function usePermission(): UsePermissionReturn {
  const [status, setStatus] = useState<CameraPermissionState>('checking');

  useEffect(() => {
    let permissionStatusObj: PermissionStatus | null = null;

    const checkPermission = async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setStatus('unavailable');
        return;
      }

      if (navigator.permissions && navigator.permissions.query) {
        try {
          permissionStatusObj = await navigator.permissions.query({
            name: 'camera' as PermissionName,
          });

          setStatus(permissionStatusObj.state as CameraPermissionState);

          permissionStatusObj.onchange = () => {
            if (permissionStatusObj) {
              logger.info(`Camera permission changed: ${permissionStatusObj.state}`);
              setStatus(permissionStatusObj.state as CameraPermissionState);
            }
          };
          return;
        } catch {
          // Some browsers (e.g. Safari / Firefox on certain platforms) throw on 'camera' query
          logger.debug('navigator.permissions.query({ name: "camera" }) not supported; falling back to prompt state');
        }
      }

      // Default initial state if permission query API not supported
      setStatus('prompt');
    };

    checkPermission();

    return () => {
      if (permissionStatusObj) {
        permissionStatusObj.onchange = null;
      }
    };
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    const streamResult = await cameraService.startStream();
    if (streamResult.success) {
      setStatus('granted');
      return true;
    }

    if (streamResult.error.type === 'CAMERA_PERMISSION_DENIED') {
      setStatus('denied');
    } else if (streamResult.error.type === 'CAMERA_DEVICE_NOT_FOUND') {
      setStatus('unavailable');
    }
    return false;
  }, []);

  const getHelpText = (): string => {
    switch (status) {
      case 'denied':
        return 'Camera access is blocked. In Chrome/Edge: click the padlock/settings icon on the left of your address bar and toggle Camera to "Allow", then reload.';
      case 'unavailable':
        return 'No camera hardware was found on your system. Please connect an external webcam or switch to a mobile device.';
      case 'prompt':
        return 'Please grant camera access when prompted by your browser to enable real-time detection and biometric unlock.';
      case 'granted':
        return 'Camera access is granted and active.';
      case 'checking':
      default:
        return 'Checking camera status...';
    }
  };

  return {
    status,
    isGranted: status === 'granted',
    isDenied: status === 'denied',
    requestPermission,
    helpText: getHelpText(),
  };
}
