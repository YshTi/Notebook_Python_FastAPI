"use client";

import { useState, useEffect, Suspense } from "react";
import { useAuth } from "@/components/auth-provider/auth-provider";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import styles from "./login.module.css";

function LoginForm() {
  const { user, login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    // Redirect if already logged in
    if (user) {
      router.push("/");
    }
  }, [user, router]);

  useEffect(() => {
    // Check confirmation URL query parameters
    const confirmed = searchParams.get("confirmed");
    const handle = setTimeout(() => {
      if (confirmed === "true") {
        setSuccessMessage("Your email has been confirmed! You can now log in.");
      } else if (confirmed === "false") {
        setError("Invalid or expired email confirmation link.");
      }
    }, 0);
    return () => clearTimeout(handle);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      await login({ email, password });
      router.push("/");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to log in. Please check your credentials.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h1 className={styles.title}>Welcome Back</h1>
        <p className={styles.subtitle}>Sign in to save and manage your private tasks</p>
      </div>

      {successMessage && <div className={styles.successAlert}>{successMessage}</div>}
      {error && <div className={styles.errorAlert}>{error}</div>}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.inputGroup}>
          <label htmlFor="email" className={styles.label}>Email Address</label>
          <input
            id="email"
            type="email"
            required
            className={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="password" className={styles.label}>Password</label>
          <input
            id="password"
            type="password"
            required
            className={styles.input}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={styles.submitButton}
        >
          {isLoading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <div className={styles.footer}>
        <span>Don&apos;t have an account? </span>
        <Link href="/register" className={styles.link}>
          Register here
        </Link>
      </div>

      <div className={styles.backToDemo}>
        <Link href="/" className={styles.demoLink}>
          ← Back to Public Demo Mode
        </Link>
      </div>
    </div>
  );
}

import { ThemeToggle } from "@/components/theme-toggle/theme-toggle";

export default function LoginPage() {
  return (
    <div className={styles.container}>
      <div className={styles.themeTogglePosition}>
        <ThemeToggle />
      </div>
      <Suspense fallback={<div className={styles.card}><p>Loading...</p></div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
