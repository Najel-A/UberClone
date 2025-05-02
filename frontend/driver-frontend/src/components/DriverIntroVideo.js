import React from "react";

const DriverIntroVideo = () => {
  return (
    <div>
      <h2>Driver Introduction Video</h2>
      <video width="100%" height="auto" controls>
        <source src="/path-to-video.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default DriverIntroVideo;
