import { auth } from "@/auth";
import UserDisplay from "../components/UserDisplay";

export default async function Dashboard() {
  const session = await auth();
  if (!session) {
    return <p>Sign in for content.</p>;
  }
  //   return <>สวัสดีท่าน : {session.user.name} ผู้เจริญ</>;
  return <UserDisplay />;
}
