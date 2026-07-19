"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth-provider/auth-provider";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "../login/login.module.css"; // Reuse card container styles

import { ThemeToggle } from "@/components/theme-toggle/theme-toggle";

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Redirect if not logged in
    if (!user && !isLoading) {
      router.push("/login");
    } else if (user) {
      const handle = setTimeout(() => {
        setName(user.name ?? "");
        setEmail(user.email);
      }, 0);
      return () => clearTimeout(handle);
    }
  }, [user, router, isLoading]);

  if (!user) {
    return <div className={styles.container}><p>Loading...</p></div>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setIsLoading(true);

    try {
      await updateProfile({
        name: name || undefined,
        email: email || undefined,
        password: password || undefined,
      });
      setSuccess(true);
      setPassword("");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Profile update failed.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.themeTogglePosition}>
        <ThemeToggle />
      </div>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>Your Profile</h1>
          <p className={styles.subtitle}>Update your personal settings</p>
        </div>

        {success && (
          <div className={styles.successAlert}>
            Profile updated successfully! {email !== user.email && "(If email changed, verification link sent to your new inbox.)"}
          </div>
        )}
        {error && <div className={styles.errorAlert}>{error}</div>}
        {!user.is_verified && (
          <div className={styles.errorAlert} style={{ backgroundColor: "rgba(245, 158, 11, 0.1)", border: "1px solid rgba(245, 158, 11, 0.3)", color: "#d97706" }}>
            Your account is currently unverified. Please check your inbox.
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="name" className={styles.label}>Full Name</label>
            <input
              id="name"
              type="text"
              className={styles.input}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your Name"
            />
          </div>

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
            <label htmlFor="password" className={styles.label}>New Password (Optional)</label>
            <input
              id="password"
              type="password"
              className={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="•••••••• (Min 6 chars)"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={styles.submitButton}
          >
            {isLoading ? "Saving..." : "Save Changes"}
          </button>
        </form>

        <div className={styles.backToDemo}>
          <Link href="/" className={styles.demoLink}>
            ← Back to Task Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
