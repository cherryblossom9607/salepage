import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcryptjs from "bcryptjs"; // หรือ library hash password อื่นๆ เช่น argon2, scrypt
import prisma from "@lib/prisma";
// import { PrismaClient } from "@prisma/client";
// const prisma = new PrismaClient();

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma), // ใช้ Prisma Adapter
  session: {
    strategy: "jwt", // ใช้ JWT สำหรับ session
  },
  providers: [
    Credentials({
      // คุณสามารถตั้งชื่อ provider ได้
      name: "Credentials",
      // กำหนด fields ที่ต้องการให้ผู้ใช้กรอก
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // ตรวจสอบว่ามี email และ password ถูกส่งมาหรือไม่
        if (!credentials?.email || !credentials?.password) {
          // return null;
          throw new Error("โปรดระบุอีเมลและรหัสผ่าน");
        }

        // ค้นหาผู้ใช้จากฐานข้อมูล
        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        // ตรวจสอบว่ามีผู้ใช้หรือไม่ และ password ตรงกันหรือไม่
        if (!user || !user.password) {
          // return null; // ไม่มีผู้ใช้ หรือผู้ใช้ไม่มี password
          throw new Error("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
        }

        const isPasswordValid = await bcryptjs.compare(
          credentials.password,
          user.password
        );

        if (isPasswordValid) {
          // คืนค่า user object ถ้า login สำเร็จ
          // สิ่งสำคัญ: ต้องคืนค่า user object ที่มี `id`
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
            // คุณสามารถเพิ่มข้อมูลอื่นๆ ที่ต้องการให้เข้าถึงได้ใน session ได้ที่นี่
          };
        }

        // คืนค่า null ถ้า login ไม่สำเร็จ
        throw new Error("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
      },
    }),
    // ถ้าคุณต้องการใช้ OAuth providers อื่นๆ ก็สามารถเพิ่มได้ที่นี่ เช่น GitHub, Google
    // GitHub,
  ],
  callbacks: {
    // นี่คือส่วนสำคัญสำหรับการจัดการ JWT และ Session
    async jwt({ token, user, account, profile }) {
      if (user) {
        // user จะถูกส่งมาเมื่อ login ครั้งแรก (จาก authorize callback)
        token.id = user.id;
        token.email = user.email;
        // คุณสามารถเพิ่มข้อมูลอื่นๆ จาก user ลงใน token ได้
      }
      return token;
    },
    async session({ session, token }) {
      // session จะถูกเรียกใช้เมื่อมีการเข้าถึง session
      if (token.id) {
        session.user.id = token.id;
        session.user.email = token.email;
      }
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isPublicRoute =
        nextUrl.pathname === "/login" ||
        nextUrl.pathname === "/register" ||
        nextUrl.pathname === "/";
      const isAuthRoute = nextUrl.pathname.startsWith("/auth");

      // ตรรกะการอนุญาต (คล้ายกับใน middleware แต่ควรอยู่ใน auth.ts เพื่อความสอดคล้อง)
      if (!isLoggedIn && !isPublicRoute && !isAuthRoute) {
        return Response.redirect(new URL("/login", nextUrl));
      }
      // หากเข้าสู่ระบบแล้วและพยายามเข้าถึงหน้าล็อกอิน/ลงทะเบียน ให้เปลี่ยนเส้นทางไปหน้าหลัก
      if (isLoggedIn && (isPublicRoute || isAuthRoute)) {
        return Response.redirect(new URL("/", nextUrl));
      }
      return true; // อนุญาตให้ดำเนินการต่อ
    },
  },
  pages: {
    signIn: "/login", // กำหนดหน้าสำหรับ Login (ถ้าต้องการ)
    // error: '/auth/error', // กำหนดหน้า Error
  },
  // Debug mode (ตั้งค่าเป็น true ใน development)
  debug: process.env.NODE_ENV === "development",
});
