"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { ref, uploadBytesResumable, getDownloadURL, getStorage } from "firebase/storage";

import styles from "./imageUploader.module.css";
import { app } from "@/app/utils/firebase";

const ImageUploader = ({ onImageUploaded, quillRef }) => {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState("");

  const createMultipleSizes = async (file) => {
    const sizes = [
      { name: "card", maxSize: 400, quality: 0.7 },
      { name: "medium", maxSize: 800, quality: 0.8 },
      { name: "large", maxSize: 1200, quality: 0.85 },
    ];

    const results = [];

    for (const sizeConfig of sizes) {
      const compressedFile = await compressImage(file, sizeConfig.maxSize, sizeConfig.quality);
      results.push({
        file: compressedFile,
        sizeName: sizeConfig.name,
      });
    }

    return results;
  };

  const compressImage = async (file, maxSize = 1200, quality = 0.7) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          if (width > height && width > maxSize) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          } else if (height > maxSize) {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";
          ctx.drawImage(img, 0, 0, width, height);

          // WebP 포맷으로 변환 (지원되는 경우)
          const outputFormat = canvas.toDataURL("image/webp").startsWith("data:image/webp")
            ? "image/webp"
            : "image/jpeg";

          canvas.toBlob(
            (blob) => {
              const fileName =
                file.name.replace(/\.[^/.]+$/, "") +
                (outputFormat === "image/webp" ? ".webp" : ".jpg");
              resolve(new File([blob], fileName, { type: outputFormat }));
            },
            outputFormat,
            quality
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
        // 파일 크기 체크 (더 엄격하게)
        if (file.size > 3 * 1024 * 1024) {
          // 3MB로 줄임
          setUploadError("파일 크기는 3MB 이하여야 합니다.");
          return;
        }

        const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
        if (!validTypes.includes(file.type)) {
          setUploadError("지원되는 이미지 형식은 JPEG, PNG, GIF, WEBP입니다.");
          return;
        }

        const imageSizes = await createMultipleSizes(file);
        const storage = getStorage(app);
        const timestamp = new Date().getTime();
        const uploadedUrls = {};

        for (let i = 0; i < imageSizes.length; i++) {
          const { file: sizedFile, sizeName } = imageSizes[i];
          const fileName = `${timestamp}_${sizeName}_${sizedFile.name}`;
          const storageRef = ref(storage, fileName);

          const uploadTask = uploadBytesResumable(storageRef, sizedFile);

          await new Promise((resolve, reject) => {
            uploadTask.on(
              "state_changed",
              (snapshot) => {
                const progress =
                  (i / imageSizes.length +
                    snapshot.bytesTransferred / snapshot.totalBytes / imageSizes.length) *
                  100;
                setUploadProgress(progress);
              },
              (error) => {
                console.error("업로드 오류:", error);
                setUploadError("이미지 업로드 중 오류가 발생했습니다: " + error.message);
                reject(error);
              },
              async () => {
                try {
                  const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                  uploadedUrls[sizeName] = downloadURL;
                  resolve();
                } catch (err) {
                  console.error("다운로드 URL 가져오기 실패:", err);
                  reject(err);
                }
              }
            );
          });
        }

        const urlArray = [uploadedUrls.card, uploadedUrls.medium, uploadedUrls.large];

        onImageUploaded(urlArray);

        setUploadProgress(100);

        if (quillRef.current) {
          const quill = quillRef.current.getEditor();
          const range = quill.getSelection() || {
            index: quill.getLength(),
          };
          quill.insertEmbed(range.index, "image", uploadedUrls.medium);
          quill.setSelection(range.index + 1, 0);
          quill.focus();
        }
      } catch (error) {
        console.error("이미지 업로드 오류:", error);
        setUploadError("이미지 업로드 중 오류가 발생했습니다.");
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
            accept="image/jpeg,image/png,image/webp"
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
            <div className={styles.progressFill} style={{ width: `${uploadProgress}%` }}></div>
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
