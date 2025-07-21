import { auth } from "@/auth";
//sever component
export default async function Profile() {
  const session = await auth();
  if (!session) {
    return <p>Please Sign in.</p>;
  }

  return (
    <div>
      <h1>Welcome, {session.user?.name || session.user?.email}!</h1>
      <p>User ID: {session.user?.id}</p>
      {/* คุณสามารถใช้ signOut() ที่นี่ได้ แต่ต้องห่อด้วย 'use client' หรือสร้าง Server Action */}
    </div>
  );
}
