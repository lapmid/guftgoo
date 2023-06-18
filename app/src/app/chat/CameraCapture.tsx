import React from "react";

export const capturePhoto = (onCapture: (data: string) => void): void => {
  try {
    navigator.mediaDevices
      .getUserMedia({
        video: true,
      })
      .then((stream): void => {
        const video = document.createElement("video");
        video.srcObject = stream;
        video.addEventListener("loadedmetadata", () => {
          const canvas = document.createElement("canvas");
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext("2d");
          ctx!.drawImage(video, 0, 0, canvas.width, canvas.height);
          const photoDataUrl = canvas.toDataURL("image/jpeg");
          onCapture(photoDataUrl);
          stopCapture(stream);
          stream.getTracks().forEach((track) => track.stop());
        });
        video.play();
      });
  } catch (error) {
    console.error("Error accessing camera:", error);
    alert(error);
  }
};
function stopCapture(stream: MediaStream | null) {
  if (stream) {
    stream.getTracks().forEach((track) => track.stop());
    stream = null; // Reset the stream variable
  }
}

export const CameraCapture: React.FC<{ onCapture: (data: string) => void }> = (
  props
): JSX.Element => {
  return (
    <div>
      <button onClick={() => capturePhoto(props.onCapture)}>Capture</button>
    </div>
  );
};

export default CameraCapture;
