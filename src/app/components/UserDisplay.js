// app/components/UserDisplay.tsx
"use client";

import { useSession, signOut } from "next-auth/react";

export default function UserDisplay() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <p>Loading session...</p>;
  }

  if (!session) {
    return <p>Not authenticated.</p>;
  }

  return (
    <div>
      <p>Welcome, {session.user?.name || session.user?.email}!</p>
      <button onClick={() => signOut()}>Sign Out</button>
    </div>
  );
}
