import { ref, uploadBytes } from "firebase/storage";
import { storage } from "./firebase";

export const uploadImage = async (file: File) => {
  if (!file) return;

  const storageRef = ref(
    storage,
    `uploads/${Date.now()}-${file.name}`
  );

  await uploadBytes(storageRef, file);

  console.log("Image stored in Firebase Storage");
};
