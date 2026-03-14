import { ref, uploadBytes } from "firebase/storage";
import { storage } from "../firebase";

export const uploadImageToStorage = async (file, folder = "uploads") => {
  if (!file) return;

  const storageRef = ref(
    storage,
    `${folder}/${Date.now()}-${file.name}`
  );

  await uploadBytes(storageRef, file);
};  
