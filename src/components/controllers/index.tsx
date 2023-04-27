import { forwardRef, useEffect, useImperativeHandle } from "react";
import { useAudio, useUserProps } from "../../context";

import { useStopwatch } from "react-timer-hook";
import {
  PAUSED_PLAYING,
  PAUSED_RECORDING,
  PLAYING_REQUESTED,
  RECORDING,
  STOPPED,
} from "../../constants";
import React from "react";

const Controllers = forwardRef(
  (
    props: {
      onTimerUpdated: (timeDetails: Timer) => void;
      onStatusChange: (status: string) => void;
    },
    ref
  ) => {
    const { audioStatus, updateAudioStatus, audioRecording } = useAudio();
    const { onAudioDownload } = useUserProps();

    const { seconds, minutes, hours, start, pause, reset } = useStopwatch({
      autoStart: false,
    });
    useEffect(() => {
      if (audioStatus === RECORDING) {
        props.onTimerUpdated({ hours, minutes, seconds });
      }
    }, [seconds, minutes, hours]);
    useEffect(() => {
      if (audioStatus === RECORDING) {
        start();
      } else if (
        audioStatus === PAUSED_PLAYING ||
        audioStatus === PAUSED_RECORDING
      ) {
        pause();
      } else {
        reset();
      }
    }, [audioStatus]);

    useImperativeHandle(ref, () => ({
      start() {
        requestMicrophone();
      },
      pause() {
        updateAudioStatus(
          audioStatus === RECORDING ? PAUSED_RECORDING : PAUSED_PLAYING
        );
      },
      stop() {
        updateAudioStatus(STOPPED);
      },
      download() {
        downloadBlob();
      },
      playAudio() {
        updateAudioStatus(PLAYING_REQUESTED);
      },
    }));

    const updateAudio = (status: string) => () => {
      updateAudioStatus(status);
    };

    const requestMicrophone = () => {
      navigator.mediaDevices
        .getUserMedia({ audio: true, video: false })
        .then(updateAudio(RECORDING))
        .catch(() =>
          alert("Please allow acccess to your microphone to continue.")
        );
    };

    useEffect(() => {
      const maincontainer = document.querySelector(
        ".voice-recorder_maincontainer"
      ) as HTMLElement;
      const controlcontainer = document.querySelector(
        ".voice-recorder_controlscontainer"
      ) as HTMLElement;

      if (maincontainer && controlcontainer) {
        const { height } = maincontainer.getBoundingClientRect();
        controlcontainer.style.height = `${height / 3}px`;
      }
    }, []);

    const downloadBlob = () => {
      const { blob = "" } = audioRecording || {};
      if (!blob) return null;
      const url = URL.createObjectURL(blob);
      const aElem = document.querySelector(
        ".voice-recorder_downloadfile"
      ) as HTMLAnchorElement;
      aElem.href = url;
      aElem.download = "audio.wav";
      aElem.click();
    };

    useEffect(() => {
      if (audioRecording) {
        const { blob = "" } = audioRecording || {};
        if (!blob || !onAudioDownload) return;
        onAudioDownload(blob);
      }
    }, [audioRecording]);

    useEffect(() => {
      if (audioStatus) {
        props.onStatusChange(audioStatus);
      }
    }, [audioStatus]);
    return (
      <>
        <a
          download
          style={{ display: "none" }}
          className="voice-recorder_downloadfile"
        />
      </>
    );
  }
);

export default Controllers;
