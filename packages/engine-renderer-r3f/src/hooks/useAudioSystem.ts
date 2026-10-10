import { useEffect } from "react";
import {
  attachAudioSystem,
  type AttachAudioSystemOpts,
} from "./attachAudioSystem";

type UseAudioSystemOpts = AttachAudioSystemOpts;

export function useAudioSystem(opts: UseAudioSystemOpts): void {
  useEffect(() => {
    return attachAudioSystem(opts);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opts.runtime, opts.port, opts.settingsStore]);
}
