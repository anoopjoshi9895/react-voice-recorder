import { useEffect, useRef, useState } from "react";
import { useAudio, useUserProps } from "../../context";
import {
  setUpCanvas as setUpCanvasUtil,
  generateCanvasFillColor,
} from "../../utils";
import { PAUSED_RECORDING, RECORDING, STOPPED } from "../../constants";
import React from "react";

/**
 * CREDITS: https://codepen.io/davidtorroija/pen/ZZzLpb?editors=0010
 * https://stackoverflow.com/questions/55407563/web-audio-api-and-javascript-get-the-correct-picks-from-microphone
 */

const TIME_OFFSET = 100;
const GRAPH_WIDTH = 2;

function Record(props: { onStop: (audio: AudioRecordingDataType) => void }) {
  const { audioStatus = "", updateAudioRecording } = useAudio();
  const { graphColor, graphShaded } = useUserProps();
  const [now, setNow] = useState<number>(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const obj = useRef<any>({});
  const status = useRef<string>(audioStatus);
  const parentRef = useRef();

  useEffect(() => {
    status.current = audioStatus;
    if (audioStatus === RECORDING) {
      /* recording resumed */
      if (obj?.current?.audioContext?.state === "suspended") {
        obj.current.audioContext.resume().then(loop);
        obj.current?.mediaRecorder?.resume();
      } else if (!obj?.current?.audioContext?.state) {
        /* recording initiated */
        navigator.mediaDevices
          .getUserMedia({ audio: true, video: false })
          .then(setUpAudioAPI);
      }
    }
    if (audioStatus === STOPPED) {
      obj?.current?.mediaRecorder?.stop();
    }
    if (audioStatus === PAUSED_RECORDING) {
      obj?.current?.audioContext?.suspend();
      obj?.current?.mediaRecorder?.pause();
    }
  }, [audioStatus]);

  useEffect(() => {
    setUpCanvas();
    window.addEventListener("resize", setUpCanvas);

    () => window.removeEventListener("resize", setUpCanvas);
  }, []);

  const setUpCanvas = () => {
    const canvas = setUpCanvasUtil(
      ["waveformgraph-record"],
      parentRef?.current
    );
    if (canvas) canvasRef.current = canvas[0];
  };

  const setUpAudioAPI = (micStream: MediaStream) => {
    try {
      // added the any type because webkitAudioContext does not exist on window typeof globalThis
      const AudioContext =
        window.AudioContext || (window as any)?.webkitAudioContext;
      const audioContext = new AudioContext();
      obj.current.audioContext = audioContext;

      const sourceNode = audioContext.createMediaStreamSource(micStream);
      obj.current.analyserNode = audioContext.createAnalyser();
      sourceNode.connect(obj?.current?.analyserNode);

      obj.current.analyserNode.fftSize = 128;
      const bufferLength = obj.current.analyserNode.frequencyBinCount;
      const dataArray = new Float32Array(bufferLength);
      obj.current.dataArray = dataArray;

      const chunks = []; // To store audio data chunks

      const mediaRecorder = new MediaRecorder(micStream, {
        mimeType: "audio/ogg; codecs=opus", // Set the desired audio format
      });

      obj.current.mediaRecorder = mediaRecorder;

      mediaRecorder.addEventListener("dataavailable", (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      });

      mediaRecorder.addEventListener("stop", () => {
        const blob = new Blob(chunks, { type: "audio/ogg; codecs=opus" });
        const recordingData = {
          blob: blob,
          duration: audioContext.currentTime, // Use audioContext's time instead of audioBuffer's duration
          graphData: obj.current.graphData ?? [],
        };

        updateAudioRecording(recordingData);
        props.onStop(recordingData);
      });

      mediaRecorder.start();
      loop();
    } catch (error) {
      console.log("error", error);
    }
  };

  const loop = () => {
    const ctx = canvasRef?.current?.getContext("2d");

    if (status.current !== RECORDING) return null;

    ctx?.clearRect(
      0,
      0,
      canvasRef?.current?.width ?? 1,
      canvasRef?.current?.height ?? 1
    );
    let maxFreq = -Infinity;

    if (Number(performance.now()) > now) {
      setNow(Number(performance.now() / TIME_OFFSET));

      if (!obj?.current?.dataArray) return null;

      /* getFloatTimeDomainData copies the current waveform, or time-domain,
      data into a Float32Array array passed into it */
      obj?.current?.analyserNode?.getFloatTimeDomainData(
        obj?.current?.dataArray
      );

      maxFreq = Math.max(0, ...(obj?.current?.dataArray ?? []));

      const freq = Math.max(1, Math.floor(maxFreq * 350));

      if (obj.current.graphData === undefined) {
        obj.current.graphData = [];
      }

      obj.current?.graphData.push({
        x: canvasRef?.current?.offsetWidth ?? 1,
        y: (canvasRef?.current?.offsetHeight ?? 1) / 2 - freq / 2,
        height: freq,
        width: GRAPH_WIDTH,
      });
    }
    draw();
    requestAnimationFrame(loop);
  };
  const draw = () => {
    const ctx = canvasRef?.current?.getContext("2d");
    if (!ctx || !obj.current?.graphData) return null;
    for (let i = 0; i < obj.current?.graphData.length; i++) {
      const bar = obj.current?.graphData[i];
      if (!bar) continue;
      ctx.fillStyle = generateCanvasFillColor(
        graphColor,
        bar.height,
        graphShaded
      ).solid;
      ctx?.fillRect(bar.x, bar.y, bar.width, bar.height);
      bar.x = bar.x - GRAPH_WIDTH;
    }
  };

  return <div ref={parentRef} className="voice-recorder_recordcontainer" />;
}

export default Record;
