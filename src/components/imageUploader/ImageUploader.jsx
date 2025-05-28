"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  getStorage,
} from "firebase/storage";

import styles from "./imageUploader.module.css";
import { app } from "@/app/utils/firebase";

const ImageUploader = ({ onImageUploaded, quillRef }) => {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState("");

  // 업로드 전 이미지 압축/리사이징
  const compressImage = async (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          // 최대 크기 설정 (예: 1200px)
          const MAX_SIZE = 1200;
          let width = img.width;
          let height = img.height;

          if (width > height && width > MAX_SIZE) {
            height = Math.round((height * MAX_SIZE) / width);
            width = MAX_SIZE;
          } else if (height > MAX_SIZE) {
            width = Math.round((width * MAX_SIZE) / height);
            height = MAX_SIZE;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);

          // 압축된 이미지를 Blob으로 변환 (품질 0.8)
          canvas.toBlob(
            (blob) => {
              resolve(new File([blob], file.name, { type: file.type }));
            },
            file.type,
            0.8,
          );
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  useEffect(() => {
    const upload = async () => {
      if (!file) return;

      setUploadError("");
      setUploadProgress(0);
      try {
        if (file.size > 5 * 1024 * 1024) {
          setUploadError("파일 크기는 5MB 이하여야 합니다.");
          return;
        }

        const validTypes = [
          "image/jpeg",
          "image/png",
          "image/gif",
          "image/webp",
        ];
        if (!validTypes.includes(file.type)) {
          setUploadError("지원되는 이미지 형식은 JPEG, PNG, GIF, WEBP입니다.");
          return;
        }

        const compressedFile = await compressImage(file);

        const name = new Date().getTime() + file.name;
        const storage = getStorage(app);
        const storageRef = ref(storage, name);

        const uploadTask = uploadBytesResumable(storageRef, compressedFile);

        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress(progress);
          },
          (error) => {
            console.error("업로드 오류:", error);
            setUploadError(
              "이미지 업로드 중 오류가 발생했습니다: " + error.message,
            );
          },
          async () => {
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              onImageUploaded(downloadURL);

              setUploadProgress(100);

              // 에디터에 이미지 삽입
              if (quillRef.current) {
                const quill = quillRef.current.getEditor();
                const range = quill.getSelection() || {
                  index: quill.getLength(),
                };
                quill.insertEmbed(range.index, "image", downloadURL);
                quill.setSelection(range.index + 1, 0);
                quill.focus();
              }
            } catch (err) {
              console.error("다운로드 URL 가져오기 실패:", err);
              setUploadError("이미지 URL을 가져오는데 실패했습니다.");
            }
          },
        );
      } catch (error) {
        console.error("이미지 압축 오류:", error);
        setUploadError("이미지 압축 중 오류가 발생했습니다.");
      }
    };
    if (file) {
      upload();
    }
  }, [file]);

  return (
    <div className={styles.container}>
      <button
        className={styles.button}
        onClick={() => {
          setOpen(!open);
        }}
      >
        <Image src="/plus.png" alt="" width={16} height={16} />
      </button>

      {open && (
        <div className={styles.add}>
          <input
            type="file"
            id="image"
            onChange={(e) => setFile(e.target.files[0])}
            style={{ display: "none" }}
            accept="image/*"
          />

          <button className={styles.addButton}>
            <label htmlFor="image">
              <Image src="/image.png" alt="" width={16} height={16} />
            </label>
          </button>
          <button className={styles.addButton}>
            <Image src="/external.png" alt="" width={16} height={16} />
          </button>
          <button className={styles.addButton}>
            <Image src="/video.png" alt="" width={16} height={16} />
          </button>
        </div>
      )}

      {/* 업로드 상태 표시 */}
      {file && uploadProgress < 100 && uploadProgress > 0 && (
        <div className={styles.uploadStatus}>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <span>{uploadProgress.toFixed(0)}% 업로드됨</span>
        </div>
      )}

      {/* 업로드 오류 표시 */}
      {uploadError && <div className={styles.uploadError}>{uploadError}</div>}
    </div>
  );
};

export default ImageUploader;
