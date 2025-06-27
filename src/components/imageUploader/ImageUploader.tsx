"use client";
import { useState, useEffect, ChangeEvent, MouseEvent } from "react";
import Image from "next/image";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  getStorage,
  UploadTaskSnapshot,
} from "firebase/storage";

import styles from "./imageUploader.module.css";
import { app } from "@/app/utils/firebase";
import { ImageUploaderProps, SizedImageResult } from "@/types";

const ImageUploader = ({ onImageUploaded, quillRef }: ImageUploaderProps) => {
  const [open, setOpen] = useState<boolean>(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadError, setUploadError] = useState<string>("");

  const createMultipleSizes = async (originalFile: File): Promise<SizedImageResult[]> => {
    const sizes = [
      { name: "card", maxSize: 400, quality: 0.7 },
      { name: "medium", maxSize: 800, quality: 0.8 },
      { name: "large", maxSize: 1200, quality: 0.85 },
    ];

    const results: SizedImageResult[] = [];

    for (const sizeConfig of sizes) {
      const sizeName = sizeConfig.name as "card" | "medium" | "large";
      const compressedFile = await compressImage(
        originalFile,
        sizeConfig.maxSize,
        sizeConfig.quality
      );
      results.push({
        file: compressedFile,
        sizeName: sizeName,
      });
    }

    return results;
  };

  const compressImage = async (
    fileToCompress: File,
    maxSize: number = 1200,
    quality: number = 0.7
  ): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        if (!e.target?.result) {
          reject(new Error("파일을 읽는 중 오류가 발생했습니다."));
          return;
        }
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
          if (!ctx) {
            reject(new Error("Canvas context를 가져오는 데 실패했습니다."));
            return;
          }
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";
          ctx.drawImage(img, 0, 0, width, height);

          // WebP 포맷으로 변환 (지원되는 경우)
          const outputFormat = canvas.toDataURL("image/webp").startsWith("data:image/webp")
            ? "image/webp"
            : "image/jpeg";

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error("이미지를 Blob으로 변환하는 데 실패했습니다."));
                return;
              }
              const fileName =
                fileToCompress.name.replace(/\.[^/.]+$/, "") +
                (outputFormat === "image/webp" ? ".webp" : ".jpg");
              resolve(new File([blob], fileName, { type: outputFormat }));
            },
            outputFormat,
            quality
          );
        };
        img.onerror = () => reject(new Error("이미지 로드 중 오류가 발생했습니다."));
        img.src = e.target.result as string;
      };
      reader.onerror = () => {
        reject(new Error("파일을 읽는 중 오류가 발생했습니다."));
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
          setFile(null);
          return;
        }

        const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
        if (!validTypes.includes(file.type)) {
          setUploadError("지원되는 이미지 형식은 JPEG, PNG, GIF, WEBP입니다.");
          setFile(null);
          return;
        }

        const imageSizes: SizedImageResult[] = await createMultipleSizes(file);
        const storage = getStorage(app);
        const timestamp = new Date().getTime();
        const uploadedUrls: { [key: string]: string } = {};

        for (let i = 0; i < imageSizes.length; i++) {
          const { file: sizedFile, sizeName } = imageSizes[i];
          const fileName = `${timestamp}_${sizeName}_${sizedFile.name}`;
          const storageRef = ref(storage, fileName);

          const uploadTask = uploadBytesResumable(storageRef, sizedFile);

          await new Promise<void>((resolve, reject) => {
            uploadTask.on(
              "state_changed",
              (snapshot: UploadTaskSnapshot) => {
                const progress =
                  (i / imageSizes.length +
                    snapshot.bytesTransferred / snapshot.totalBytes / imageSizes.length) *
                  100;
                setUploadProgress(progress);
              },
              (error: Error) => {
                console.error("업로드 오류:", error);
                setUploadError("이미지 업로드 중 오류가 발생했습니다: " + error.message);
                reject(error);
              },
              async () => {
                try {
                  const downloadURL: string = await getDownloadURL(uploadTask.snapshot.ref);
                  uploadedUrls[sizeName] = downloadURL;
                  resolve();
                } catch (err: any) {
                  console.error("다운로드 URL 가져오기 실패:", err);
                  reject(err);
                }
              }
            );
          });
        }

        const urlArray: string[] = [uploadedUrls.card, uploadedUrls.medium, uploadedUrls.large];

        onImageUploaded(urlArray);

        if (quillRef.current) {
          const quill = quillRef.current.getEditor();
          const range = quill.getSelection() || {
            index: quill.getLength(),
            length: 0,
          };
          quill.insertEmbed(range.index, "image", uploadedUrls.medium);
          quill.setSelection(range.index + 1, 0);
          quill.focus();
        }
        setUploadProgress(100);
        setFile(null);
      } catch (error: any) {
        console.error("이미지 업로드 오류:", error);
        setUploadError("이미지 업로드 중 오류가 발생했습니다.");
        setUploadProgress(0);
        setFile(null);
      }
    };

    if (file) {
      upload();
    }
  }, [file, onImageUploaded, quillRef]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>): void => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleToggleOpen = (e: MouseEvent<HTMLButtonElement>): void => {
    setOpen((prev) => !prev);
    if (open) {
      setFile(null);
      setUploadProgress(0);
      setUploadError("");
    }
  };

  return (
    <div className={styles.container}>
      <button className={styles.button} onClick={handleToggleOpen}>
        <Image src="/plus.png" alt="" width={16} height={16} />
      </button>

      {open && (
        <div className={styles.add}>
          <input
            type="file"
            id="image"
            onChange={handleFileChange}
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
