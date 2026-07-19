"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle/theme-toggle";
import styles from "../login/login.module.css"; // Reuse card and container styles

function ConfirmContent() {
  const searchParams = useSearchParams();
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null);

  useEffect(() => {
    const successParam = searchParams.get("success");
    const handle = setTimeout(() => {
      if (successParam === "true") {
        setIsSuccess(true);
      } else if (successParam === "false") {
        setIsSuccess(false);
      }
    }, 0);
    return () => clearTimeout(handle);
  }, [searchParams]);

  return (
    <div className={styles.card} style={{ textAlign: "center", alignItems: "center" }}>
      {isSuccess === true ? (
        <>
          <div style={{
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            backgroundColor: "rgba(16, 185, 129, 0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#10b981",
            fontSize: "32px",
            marginBottom: "8px"
          }}>
            ✓
          </div>
          <h1 className={styles.title}>Email Confirmed!</h1>
          <p className={styles.subtitle}>
            Your email verification was successful. You can now access your private dashboard.
          </p>
          <Link href="/" style={{ width: "100%", textDecoration: "none" }}>
            <button className={styles.submitButton}>
              Go to Task Manager
            </button>
          </Link>
        </>
      ) : isSuccess === false ? (
        <>
          <div style={{
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            backgroundColor: "rgba(239, 68, 68, 0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#ef4444",
            fontSize: "32px",
            marginBottom: "8px"
          }}>
            ✕
          </div>
          <h1 className={styles.title}>Verification Failed</h1>
          <p className={styles.subtitle}>
            The link is invalid, expired, or has already been used to confirm this email.
          </p>
          <Link href="/" style={{ width: "100%", textDecoration: "none" }}>
            <button className={styles.submitButton} style={{ backgroundColor: "var(--color-gray-500)" }}>
              Go to Task Manager
            </button>
          </Link>
        </>
      ) : (
        <>
          <h1 className={styles.title}>Verifying...</h1>
          <p className={styles.subtitle}>Please wait while we process your request.</p>
        </>
      )}
    </div>
  );
}

export default function ConfirmPage() {
  return (
    <div className={styles.container}>
      <div className={styles.themeTogglePosition}>
        <ThemeToggle />
      </div>
      <Suspense fallback={<div className={styles.card}><p>Processing verification...</p></div>}>
        <ConfirmContent />
      </Suspense>
    </div>
  );
}
