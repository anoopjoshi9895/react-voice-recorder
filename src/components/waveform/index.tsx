import { useState, useEffect } from "react";
import { useAudio, useUserProps } from "../../context";
import Record from "./record";
import Playback from "./playback";
import {
  PAUSED_PLAYING,
  PLAYING,
  PLAYING_REQUESTED,
  STOPPED,
} from "../../constants";
import React from "react";

function Waveform(props: { onStop: (audio: AudioRecordingDataType) => void }) {
  const { audioStatus } = useAudio();
  const { waveContainerStyle } = useUserProps();
  const [isRecordingOrPlayingback, setIsRecordingOrPlayingback] =
    useState<string>("");

  useEffect(() => {
    if (
      audioStatus === PLAYING ||
      audioStatus === PLAYING_REQUESTED ||
      audioStatus === PAUSED_PLAYING ||
      audioStatus === STOPPED
    ) {
      setIsRecordingOrPlayingback("playing");
    } else {
      setIsRecordingOrPlayingback("recording");
    }
  }, [audioStatus]);

  return (
    <div
      className="voice-recorder_waveformcontainer"
      style={waveContainerStyle}
    >
      {isRecordingOrPlayingback === "playing" ? <Playback /> : null}
      {isRecordingOrPlayingback === "recording" ? <Record {...props} /> : null}
    </div>
  );
}

export default Waveform;
