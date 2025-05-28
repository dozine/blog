"use client";
import Image from "next/image";
import Link from "next/link";
import styles from "./comments.module.css";
import useSWR from "swr";
import { useSession } from "next-auth/react";
import { useState } from "react";

const fetcher = async (url) => {
  const res = await fetch(url);
  const data = await res.json();

  if (!res.ok) {
    const error = new Error(data.message);
    throw error;
  }
  return data;
};

const Comments = ({ postSlug }) => {
  const { status } = useSession();

  const { data, mutate, isLoading } = useSWR(
    `http://localhost:3000/api/comments?postSlug=${postSlug}`,
    fetcher,
  );

  const [desc, setDesc] = useState("");

  const handleSubmit = async () => {
    try {
      if (!desc.trim()) {
        alert("Please write a comment");
        return;
      }
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ desc, postSlug }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Something went wrong!");
      }
      const newComment = await response.json();
      mutate(
        (currentData) => {
          return [newComment, ...(currentData || [])];
        },
        { revalidate: false },
      );
      setDesc("");
    } catch (error) {
      console.error("An error occurred", error);
      alert(error.message);
    }
  };
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Comments</h1>
      {status === "authenticated" ? (
        <div className={styles.write}>
          <textarea
            placeholder="write a comment ... "
            className={styles.input}
            onChange={(e) => setDesc(e.target.value)}
          />
          <button className={styles.button} onClick={handleSubmit}>
            Send
          </button>
        </div>
      ) : (
        <Link href="/login">Login to write a comment</Link>
      )}
      <div className={styles.comments}>
        {isLoading
          ? "loading"
          : data?.map((item) => (
              <div className={styles.comment} key={item.id}>
                <div className={styles.user}>
                  {item?.user?.image && (
                    <Image
                      src={item.user.image}
                      alt=""
                      width={50}
                      height={50}
                      className={styles.image}
                    />
                  )}
                  <div className={styles.userInfo}>
                    <span className={styles.username}>
                      {item?.user?.name || "Anounymous"}
                    </span>
                    <span className={styles.date}>{item.createdAt}</span>
                  </div>
                </div>
                <p className={styles.userInfo}>{item.desc}</p>
              </div>
            ))}
      </div>
    </div>
  );
};
export default Comments;
