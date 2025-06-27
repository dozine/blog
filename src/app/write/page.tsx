"use client";
import React from "react";
import styles from "./writePage.module.css";
import { useEffect, useRef, useState } from "react";
import "react-quill-new/dist/quill.bubble.css";
import "react-quill-new/dist/quill.snow.css";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import editorModules from "../utils/editor";
import PostSettingModal from "@/components/postSettingModal/PostSettingModal";
import ImageUploader from "@/components/imageUploader/ImageUploader";
import { Category, Tag } from "@prisma/client";
import { TagWithPostCount } from "@/types/tag";
import { PostWithFormattedTags, UpdatePostBody } from "@/types";
import type { default as ReactQuillType } from "react-quill-new";
import ReactQuill from "react-quill-new";

const registerImageResize = async () => {
  if (typeof window !== "undefined") {
    const Quill = (await import("react-quill-new")).Quill;
    const ImageResize = (await import("quill-image-resize-module-react")).default;
    Quill.register("modules/imageResize", ImageResize);
  }
};

const WritePage = () => {
  const { status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const isEditing: boolean = searchParams.get("edit") === "true";
  const editSlug: string = searchParams.get("slug");

  const [media, setMedia] = useState<string | string[] | null>("");
  const [value, setValue] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  // 모달과 관련된 상태
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);

  // 설정값들
  const [catSlug, setCatSlug] = useState<string>("");
  const [tagInput, setTagInput] = useState<string>("");
  const [tags, setTags] = useState<Tag[]>([]);
  const [availableTags, setAvailableTags] = useState<TagWithPostCount[]>([]);
  const [isPublished, setIsPublished] = useState<boolean>(false);
  const [categories, setCategories] = useState<Category[]>([]);

  const quillRef = useRef<ReactQuillType | null>(null);

  useEffect(() => {
    registerImageResize();
  }, []);

  useEffect(() => {
    if (isEditing && editSlug) {
      const fetchPost = async () => {
        setLoading(true);
        try {
          const res = await fetch(`/api/posts/${editSlug}`);
          if (!res.ok) throw new Error("게시글을 불러올 수 없습니다.");

          const post: PostWithFormattedTags = await res.json();
          setTitle(post.title);
          setValue(post.desc);
          setMedia(post.img || "");
          setCatSlug(post.catSlug || "");
          setIsPublished(Boolean(post.isPublished));

          if (post.tags && Array.isArray(post.tags)) {
            setTags(post.tags);
          }
        } catch (err) {
          console.error("게시글 불러오기 실패:", err);
          alert("게시글을 불러올 수 없습니다.");
        } finally {
          setLoading(false);
        }
      };
      fetchPost();
    } else if (isEditing && !editSlug) {
      console.error("수정할 게시글의 slug가 없습니다.");
    }
  }, [isEditing, editSlug]);

  // 카테고리 불러오기
  useEffect(() => {
    const getCategories = async () => {
      try {
        const res = await fetch("/api/categories");
        if (!res.ok) throw new Error("카테고리를 불러올 수 없습니다.");
        const data: Category[] = await res.json();
        setCategories(data);
      } catch (err: any) {
        console.error("카테고리 가져오기 실패:", err);
      }
    };
    getCategories();
  }, []);

  // 사용 가능한 태그 불러오기
  useEffect(() => {
    const fetchAvailableTags = async () => {
      try {
        const res = await fetch("/api/tags");
        if (!res.ok) throw new Error("태그를 불러올 수 없습니다.");

        const data: TagWithPostCount[] = await res.json();
        setAvailableTags(data);
      } catch (err: any) {
        console.error("태그 불러오기 실패:", err);
      }
    };
    fetchAvailableTags();
  }, []);

  // 이미지 업로드 완료 시 호출되는 함수
  const handleImageUploaded = (urls: string[]) => {
    setMedia(urls);
  };

  const slugify = (str: string) =>
    str
      .normalize("NFC")
      .trim()
      .replace(/[^\w가-힣\s-]/g, "") // 영문, 숫자, 한글, 공백, 하이픈(-)만 허용
      .replace(/\s+/g, "-") // 공백을 하이픈으로 변환
      .replace(/-+/g, "-") // 연속된 하이픈 제거
      .toLowerCase();

  // 게시하기 버튼 클릭 시 모달 열기
  const handlePublishClick = () => {
    if (!title.trim()) {
      alert("제목을 입력해주세요.");
      return;
    }
    if (!value.trim()) {
      alert("내용을 입력해주세요.");
      return;
    }
    setShowSettingsModal(true);
  };

  // 모달에서 최종 게시 버튼 클릭 시
  const handleFinalPublish = async () => {
    const finalCatSlug: string = catSlug || "uncategorized";
    const tagIds: string[] = tags.map((tag) => tag.id);

    try {
      if (isEditing) {
        // 수정 API 호출
        const updateBody: UpdatePostBody = {
          title,
          desc: value,
          img: media,
          catSlug: finalCatSlug,
          tags: tagIds,
          isPublished,
        };
        const res = await fetch(`/api/posts/${editSlug}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateBody),
        });

        if (!res.ok) {
          const errorData = await res.json();
          console.log("Error response data:", errorData);
          throw new Error(errorData.message || "게시글 수정에 실패했습니다.");
        }

        alert("게시글이 성공적으로 수정되었습니다.");
        router.push(`/posts/${editSlug}`);
      } else {
        // 새 게시글 작성 API 호출
        const createBody = {
          title,
          desc: value,
          img: Array.isArray(media) ? media : media ? [media] : [],
          slug: slugify(title),
          catSlug: finalCatSlug,
          tags: tagIds,
          isPublished,
        };

        const res = await fetch("/api/posts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(createBody),
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "게시글 작성에 실패했습니다.");
        }

        const data: { slug: string } = await res.json();
        console.log("slug after submit:", data.slug);
        router.push(`/posts/${data.slug}`);
      }
    } catch (err) {
      console.error("Error submitting post:", err);
      alert(err.message);
    } finally {
      setShowSettingsModal(false);
    }
  };

  if (status === "loading" || loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  if (status === "unauthenticated") {
    router.push("/");
    return null;
  }

  return (
    <div className={styles.container}>
      {/* 제목 입력 */}
      <input
        type="text"
        placeholder="Title"
        className={styles.input}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      {/* 에디터 영역 */}
      <div className={styles.editor}>
        {/* 이미지 업로더 컴포넌트 */}
        <ImageUploader onImageUploaded={handleImageUploaded} quillRef={quillRef} />

        {/* Quill 에디터 */}
        <ReactQuill
          ref={quillRef as any}
          className={styles.textArea}
          theme="bubble"
          value={value}
          onChange={setValue}
          placeholder="Tell your story..."
          modules={editorModules}
        />
      </div>

      {/* 게시 버튼 */}
      <button className={styles.publish} onClick={handlePublishClick}>
        {isEditing ? "수정하기" : "Publish"}
      </button>

      {/* 설정 모달 */}
      <PostSettingModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        catSlug={catSlug}
        setCatSlug={setCatSlug}
        isPublished={isPublished}
        setIsPublished={setIsPublished}
        tagInput={tagInput}
        setTagInput={setTagInput}
        tags={tags}
        setTags={setTags}
        categories={categories}
        availableTags={availableTags}
        setAvailableTags={setAvailableTags}
        onPublish={() => {
          handleFinalPublish();
          setShowSettingsModal(false);
        }}
      />
    </div>
  );
};

export default WritePage;
