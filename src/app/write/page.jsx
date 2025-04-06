"use client";
import Image from "next/image";
import styles from "./writePage.module.css";
import { useEffect, useRef, useState } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.bubble.css";
import "react-quill-new/dist/quill.snow.css";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  getStorage,
} from "firebase/storage";
import { app } from "../utils/firebase";
import editorModules from "../utils/editor";

const WritePage = () => {
  const { status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const isEditing = searchParams.get("edit") === "true";
  const editSlug = searchParams.get("slug");

  const [open, setOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [media, setMedia] = useState("");
  const [value, setValue] = useState("");
  const [title, setTitle] = useState("");
  const [catSlug, setCatSlug] = useState("");
  const [loading, setLoading] = useState(false);

  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState("");
  const quillRef = useRef(null);

  useEffect(() => {
    if (isEditing && editSlug) {
      const fetchPost = async () => {
        setLoading(true);
        try {
          const res = await fetch(`/api/posts/${editSlug}`);
          if (!res.ok) throw new Error("게시글을 불러올 수 없습니다.");

          const post = await res.json();
          setTitle(post.title);
          setValue(post.desc);
          setMedia(post.img || "");
          setCatSlug(post.catSlug || "");
        } catch (err) {
          console.error("게시글 불러오기 실패:", err);
          alert("게시글을 불러올 수 없습니다.");
        } finally {
          setLoading(false);
        }
      };
      fetchPost();
    } else if (isEditing & !editSlug) {
      console.error("수정할 게시글의 slug가 없습니다.");
    }
  }, [isEditing, editSlug]);

  useEffect(() => {
    const upload = () => {
      if (!file) return;

      setUploadError("");
      setUploadProgress(0);

      if (file.size > 5 * 1024 * 1024) {
        setUploadError("파일 크기는 5MB 이하여야 합니다.");
        return;
      }

      const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
      if (!validTypes.includes(file.type)) {
        setUploadError("지원되는 이미지 형식은 JPEG, PNG, GIF, WEBP입니다.");
        return;
      }

      const name = new Date().getTime() + file.name;
      const storage = getStorage(app);
      const storageRef = ref(storage, name);

      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log("Upload is " + progress + "% done");
          switch (snapshot.state) {
            case "paused":
              console.log("Upload is paused");
              break;
            case "running":
              console.log("Upload is running");
              break;
          }
        },
        (error) => {
          console.error("업로드 오류:", error);
          setUploadError(
            "이미지 업로드 중 오류가 발생했습니다: " + error.message
          );
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref)
            .then((downloadURL) => {
              console.log("파일 업로드 완료:", downloadURL);
              setMedia(downloadURL);
              setUploadProgress(100);
              const quill = quillRef.current.getEditor();
              const range = quill.getSelection(true);

              quill.insertEmbed(range?.index || 0, "image", downloadURL);
              quill.setSelection((range?.index || 0) + 1);
            })
            .catch((err) => {
              console.error("다운로드 URL 가져오기 실패:", err);
              setUploadError("이미지 URL을 가져오는데 실패했습니다.");
            });
        }
      );
    };
    if (file) {
      upload();
    }
  }, [file]);
  if (status === "loading" || loading) {
    return <div className={styles.loading}>Loging...</div>;
  }
  if (status === "unauthenticated") {
    router.push("/");
    return null;
  }

  const slugify = (str) =>
    str
      .normalize("NFC")
      .trim()
      .replace(/[^\w가-힣\s-]/g, "") // 영문, 숫자, 한글, 공백, 하이픈(-)만 허용
      .replace(/\s+/g, "-") // 공백을 하이픈으로 변환
      .replace(/-+/g, "-") // 연속된 하이픈 제거
      .toLowerCase();

  const handleSubmit = async () => {
    if (!title || !value) {
      alert("제목과 내용을 입력해주세요.");
      return;
    }

    const finalCatSlug = catSlug || "일반";

    try {
      if (isEditing) {
        // 수정 API 호출
        const res = await fetch(`/api/posts/${editSlug}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title,
            desc: value,
            img: media,
            catSlug: finalCatSlug,
            tags: [], // 필요에 따라 추가
          }),
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "게시글 수정에 실패했습니다.");
        }

        alert("게시글이 성공적으로 수정되었습니다.");
        router.push(`/posts/${editSlug}`);
      } else {
        // 새 게시글 작성 API 호출
        const res = await fetch("/api/posts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title,
            desc: value,
            img: media,
            slug: slugify(title),
            catSlug: finalCatSlug,
          }),
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "게시글 작성에 실패했습니다.");
        }

        const data = await res.json();
        router.push(`/posts/${data.slug}`);
      }
    } catch (err) {
      console.error("Error submitting post:", err);
      alert(err.message);
    }
  };

  return (
    <div className={styles.container}>
      <input
        type="text"
        placeholder="Title"
        className={styles.input}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <div className={styles.editor}>
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

        <ReactQuill
          ref={quillRef}
          className={styles.textArea}
          theme="bubble"
          value={value}
          onChange={setValue}
          placeholder="Tell your story..."
          modules={editorModules}
        />
      </div>
      <button className={styles.publish} onClick={handleSubmit}>
        {isEditing ? "수정하기" : "Publish"}
      </button>
    </div>
  );
};

export default WritePage;
