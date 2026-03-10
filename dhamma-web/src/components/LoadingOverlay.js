import { useEffect, useState } from "react";
import loadingImage from "../images/loading_image.png";
import "./LoadingOverlay.css";

export default function LoadingOverlay() {
  const [transparentSrc, setTransparentSrc] = useState(loadingImage);

  useEffect(() => {
    let isActive = true;
    const image = new Image();
    image.src = loadingImage;
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = image.naturalWidth || image.width;
      canvas.height = image.naturalHeight || image.height;
      const context = canvas.getContext("2d");
      if (!context) {
        return;
      }
      context.drawImage(image, 0, 0);
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const { data } = imageData;
      const cornerPixels = [
        0,
        canvas.width - 1,
        (canvas.height - 1) * canvas.width,
        canvas.width * canvas.height - 1,
      ]
        .map((index) => {
          const base = index * 4;
          return [data[base], data[base + 1], data[base + 2]];
        })
        .filter(Boolean);

      const background = cornerPixels.reduce(
        (acc, color) => acc.map((value, idx) => value + color[idx]),
        [0, 0, 0]
      );
      const averageBackground = background.map((value) => value / cornerPixels.length);
      const threshold = 45;

      for (let i = 0; i < data.length; i += 4) {
        const dr = data[i] - averageBackground[0];
        const dg = data[i + 1] - averageBackground[1];
        const db = data[i + 2] - averageBackground[2];
        const distance = Math.sqrt(dr * dr + dg * dg + db * db);
        if (distance < threshold) {
          data[i + 3] = 0;
        }
      }

      context.putImageData(imageData, 0, 0);
      const transparentUrl = canvas.toDataURL("image/png");
      if (isActive) {
        setTransparentSrc(transparentUrl);
      }
    };
    return () => {
      isActive = false;
    };
  }, []);

  return (
    <div className="loading-overlay" role="status" aria-live="polite">
      <img src={transparentSrc} alt="" className="loading-image" />
    </div>
  );
}
