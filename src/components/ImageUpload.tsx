import React from "react";
import { uploadImage } from "../firebase/uploadImage";

const ImageUpload = () => {
  return (
    <div>
      <h3>Upload Image</h3>

      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) uploadImage(file);
        }}
      />
    </div>
  );
};

export default ImageUpload;
