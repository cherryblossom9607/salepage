// lib/prisma.js หรือ utils/prisma.js

import { PrismaClient } from "@prisma/client";

let prisma;

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
  // ใช้ globalThis แทน global เพื่อความเข้ากันได้ที่กว้างขึ้น (Node.js และบาง Edge environment)
  // อย่างไรก็ตาม สำหรับ Edge Runtime โดยตรง เช่น Middleware บางครั้งก็ยังไม่ได้
  if (!globalThis.prisma) {
    // เปลี่ยนจาก global เป็น globalThis
    globalThis.prisma = new PrismaClient();
  }
  prisma = globalThis.prisma;
}

export default prisma;
