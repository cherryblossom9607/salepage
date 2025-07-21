// middleware.ts
import { auth } from "@/auth"; // ตรวจสอบเส้นทางให้ถูกต้องตามที่คุณเก็บไฟล์ auth.ts

export default auth; // แค่นี้ก็พอ เพราะ authorized callback ใน auth.ts จัดการหมดแล้ว

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
