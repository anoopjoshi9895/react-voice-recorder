import PropTypes from "prop-types";

import React, { forwardRef, useRef, useImperativeHandle } from "react";
import { AudioProvider, UserPropsProvider } from "../context";
import Waveform from "./waveform";
import Controllers from "./controllers";

export const VoiceRecorder = forwardRef((props: VoiceRecorderProps, ref) => {
  const { mainContainerStyle, height, width, ...rest } = props as any;

  const mainContainerStyleComplete: any = {
    ...mainContainerStyle,
    height,
    width,
  };
  const controllerRef: any = useRef();
  useImperativeHandle(ref, () => ({
    start() {
      controllerRef?.current?.start();
    },
    pause() {
      controllerRef?.current?.pause();
    },
    stop() {
      controllerRef?.current?.stop();
    },
    download() {
      controllerRef?.current?.download();
    },
    playAudio() {
      controllerRef?.current?.playAudio();
    },
  }));
  return (
    <div>
      <AudioProvider>
        <UserPropsProvider userPropsValue={rest}>
          <div
            className="voice-recorder_maincontainer"
            style={mainContainerStyleComplete}
          >
            <Waveform
              onStop={(audioData) => {
                props.onStop?.(audioData.blob);
              }}
            />
            <Controllers
              onStatusChange={(status) => {
                props.onStatusChange?.(status?.trim());
              }}
              onTimerUpdated={(timer: Timer) => {
                props.onTimerUpdated?.(timer);
              }}
              ref={controllerRef}
            />
          </div>
        </UserPropsProvider>
      </AudioProvider>
    </div>
  );
});

VoiceRecorder.propTypes = {
  mainContainerStyle: PropTypes.object,
  height: PropTypes.string || PropTypes.number,
  width: PropTypes.string || PropTypes.number,
};
