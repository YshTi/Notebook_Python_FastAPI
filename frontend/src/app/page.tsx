"use client";

import { useEffect, useState } from "react";

type BackendResponse = {
  message: string;
};

export default function Home() {
  const [message, setMessage] = useState("Connecting to backend...");
  const [error, setError] = useState(false);

  useEffect(() => {
    async function loadBackend() {
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

      try {
        const response = await fetch(`${apiUrl}/`);

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const data: BackendResponse = await response.json();

        setMessage(data.message);
        setError(false);
      } catch {
        setMessage("Could not connect to the FastAPI backend");
        setError(true);
      }
    }

    void loadBackend();
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <section className="w-full max-w-xl rounded-2xl bg-white p-8 shadow-lg">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
          Junior Full-Stack Assignment
        </p>

        <h1 className="mt-2 text-4xl font-bold text-slate-900">
          TODO Application
        </h1>

        <div
          className={`mt-6 rounded-lg p-4 ${
            error
              ? "bg-red-50 text-red-700"
              : "bg-green-50 text-green-700"
          }`}
        >
          {message}
        </div>
      </section>
    </main>
  );
}