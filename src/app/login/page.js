"use client";

import { useState } from "react";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa6";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

// --- เพิ่ม Zod และ React Hook Form Imports ---
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
// -------------------------------------------

// 1. กำหนด Zod Schema สำหรับข้อมูลฟอร์ม
const signInSchema = z.object({
  email: z.string().email("รูปแบบอีเมลไม่ถูกต้อง").min(1, "กรุณากรอกอีเมล"),
  password: z
    .string()
    .min(1, "กรุณากรอกรหัสผ่าน")
    .min(5, "รหัสผ่านต้องมากกว่า 5 ตัว"),
});

export default function SignIn() {
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  // 2. ใช้ useForm พร้อม zodResolver
  const {
    register, // ใช้สำหรับผูก input กับ React Hook Form
    handleSubmit, // ใช้จัดการ onSubmit
    formState: { errors, isSubmitting }, // ดึงข้อผิดพลาดและสถานะการส่งฟอร์ม
    reset, // สำหรับรีเซ็ตฟอร์ม (ถ้าจำเป็น)
  } = useForm({
    resolver: zodResolver(signInSchema), // กำหนดให้ Zod เป็นตัวจัดการ validation
    defaultValues: {
      // สามารถกำหนดค่าเริ่มต้นได้
      email: "",
      password: "",
    },
  });

  // 3. ปรับปรุง handleSubmit ให้รับข้อมูลที่ถูก validate แล้ว
  const onSubmit = async (data) => {
    setError(""); // เคลียร์ข้อผิดพลาดที่แสดงก่อนหน้านี้
    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: data.email, // ใช้ข้อมูลจาก data ที่ถูก validate แล้ว
        password: data.password, // ใช้ข้อมูลจาก data ที่ถูก validate แล้ว
      });

      if (result.error) {
        setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาลองใหม่");
      } else {
        router.push("/dashboard");
      }
    } catch (apiError) {
      // เปลี่ยนชื่อตัวแปร error เป็น apiError เพื่อไม่ให้ซ้ำกับ error จาก state
      setError("เกิดข้อผิดพลาดที่ไม่คาดคิด กรุณาลองใหม่");
      console.error("API Error:", apiError); // แสดงข้อผิดพลาดใน console เพื่อ debug
    }
  };

  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className="bg-black/90 min-h-dvh text-white flex justify-center items-center">
      {/* 4. ใช้ handleSubmit จาก useForm */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-350 max-w-[400px] h-fit m-4 bg-gradient-to-b from-indigo-800/50 to-indigo-500/50 rounded-2xl p-4"
      >
        <div className="mt-4">
          <label htmlFor="email">Email</label>
          {/* 5. ใช้ {...register("email")} แทน value และ onChange */}
          <input
            type="text"
            id="email"
            autoComplete="off"
            {...register("email")} // ผูก input กับฟิลด์ 'email' ใน schema
          />
          {/* 6. แสดงข้อผิดพลาดจาก Zod/React Hook Form */}
          {errors.email && (
            <p className="text-red-300 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="password">Password</label>
          <div className="input-group">
            {/* 7. ใช้ {...register("password")} */}
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              autoComplete="off"
              {...register("password")} // ผูก input กับฟิลด์ 'password' ใน schema
            />
            <button
              type="button"
              className="border-l border-l-white hover:bg-white hover:text-gray-800 hover:border-none"
              onClick={handleTogglePassword}
            >
              {showPassword ? <FaRegEyeSlash /> : <FaRegEye />}
            </button>
          </div>
          {/* 8. แสดงข้อผิดพลาดจาก Zod/React Hook Form */}
          {errors.password && (
            <p className="text-red-300 text-sm mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          className="border border-white p-2 mt-4 rounded w-full hover:bg-white/50 hover:border-none cursor-pointer"
          disabled={isSubmitting} // ปิดปุ่มระหว่างการส่งฟอร์มเพื่อป้องกันการส่งซ้ำ
        >
          {isSubmitting ? "กำลังเข้าสู่ระบบ..." : "Sign in"}
        </button>

        {error && (
          <div
            className="bg-red-200/80 text-red-700 mt-4 px-2 py-1 rounded"
            role="alert"
          >
            <strong className="font-bold text-center">ผิดพลาด !</strong>
            <span className="block sm:inline text-center"> {error}</span>
          </div>
        )}
      </form>
    </div>
  );
}
