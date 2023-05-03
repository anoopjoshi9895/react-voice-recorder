import React, { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";

export const VoicePlayer = (props: { url: string }) => {
  // const recordedData = props.recordedData;
  const [playing, setPlaying] = useState(false);
  const trackRef = useRef(null);
  const waveformRef: any = useRef(null);
  const containerRef: any = useRef(null);
  const [timer, setTimer] = useState<Timer>({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const formatTime = (time: number) =>
    time.toLocaleString("en-US", {
      minimumIntegerDigits: 2,
      useGrouping: false,
    });

  useEffect(() => {
    waveformRef.current = WaveSurfer.create({
      barWidth: 2,
      barRadius: 3,
      barGap: 3,
      barMinHeight: 1,
      cursorWidth: 1,
      container: containerRef?.current,
      autoCenter: false,
      backend: "WebAudio",
      height: 26,
      progressColor: "#211829",
      responsive: true,
      waveColor: "#C4C4C4",
      cursorColor: "transparent",
    });
    // console.log(waveformRef.current);
    waveformRef?.current?.load(trackRef.current);
    waveformRef?.current.on("ready", setInitialTime);
    waveformRef?.current.on("audioprocess", updateTimer);

    // Need to watch for seek in addition to audioprocess as audioprocess doesn't fire
    // if the audio is paused.
    waveformRef?.current.on("seek", updateTimer);
    return () => waveformRef.current.destroy();
  }, []);

  const setInitialTime = () => {
    const timeDetails = secondsToTimestamp(waveformRef?.current?.getDuration());
    setTimer(timeDetails);
  };
  const updateTimer = () => {
    const timeDetails = secondsToTimestamp(
      waveformRef?.current?.getCurrentTime()
    );
    setTimer(timeDetails);
  };

  const secondsToTimestamp = (seconds: number) => {
    seconds = Math.floor(seconds);
    const h: any = Math.floor(seconds / 3600);
    const m: any = Math.floor((seconds - h * 3600) / 60);
    const s: any = seconds - h * 3600 - m * 60;

    return { hours: h, minutes: m, seconds: s };
  };

  const handlePlay = () => {
    setPlaying((prevState) => !prevState);
    waveformRef.current.playPause();
  };

  const url =
    "https://happyplace-dev.s3.ap-south-1.amazonaws.com/1683074993536/57631721-c476-4c6a-a0b0-c0ce42b1eabb-fileName.opus?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIA5D5GD3IBC5V7JCNH%2F20230503%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Date=20230503T004956Z&X-Amz-Expires=86520&X-Amz-Signature=f9ad347f897ff7287fd120fc65df362d6b509e41376302ef768027592efb0815&X-Amz-SignedHeaders=host&x-id=GetObject";

  return (
    <div className="flex items-center py-1">
      <button
        onClick={handlePlay}
        className="w-10 h-10 flex items-center justify-center bg-[#5C2D91] flex-none rounded-full"
      >
        {!playing ? (
          <svg
            width="11"
            height="13"
            viewBox="0 0 11 13"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M1.15 12.6816C0.9 12.8482 0.645833 12.8566 0.3875 12.7066C0.129167 12.5566 0 12.3316 0 12.0316V0.781579C0 0.481579 0.129167 0.256579 0.3875 0.106579C0.645833 -0.0434211 0.9 -0.0350877 1.15 0.131579L10 5.78158C10.2333 5.93158 10.35 6.13991 10.35 6.40658C10.35 6.67325 10.2333 6.88158 10 7.03158L1.15 12.6816Z"
              fill="white"
            />
          </svg>
        ) : (
          <svg
            width="8"
            height="13"
            viewBox="0 0 8 13"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="2.2" height="12.9" rx="1.1" fill="white" />
            <rect x="5.39844" width="2.2" height="12.9" rx="1.1" fill="white" />
          </svg>
        )}
      </button>
      <div className="voice-recorder_stopwatch text-[13px] font-medium text-[#322837] px-2 min-w-[50px] text-right">
        <span>{formatTime(timer.minutes)}</span>:
        <span>{formatTime(timer.seconds)}</span>
      </div>
      <div ref={containerRef} style={{ height: "26px", width: "192px" }} />
      {/* <audio ref={trackRef} src={URL.createObjectURL(recordedData)} /> */}
      {<audio ref={trackRef} src={props.url} />}
    </div>
  );
};
