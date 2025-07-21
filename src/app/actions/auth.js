import { SignupFormSchema } from "@/app/lib/definitions";
// import { createSession } from "@lib/session";
// import { deleteSession } from "@/app/lib/session";
import { redirect } from "next/dist/server/api-utils";

export async function signup(state, formData) {
  // Validate form fields
  const validatedFields = SignupFormSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  // If any form fields are invalid, return early
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  // Call the provider or db to create a user...
  const { name, email, password } = validatedFields.data;
  const hashedPassword = await bcrypt.hash(password, 10);
  console.log(name, email, hashedPassword);

  await createSession(user.name);

  redirect("/profile");
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}
