import { AuthForm } from "@/app/login/auth-form";
import { AuthFrame } from "@/app/login/auth-frame";
import { getAuthToken } from "@/lib/server-auth";
import { redirect } from "next/navigation";

type RegisterPageProps = {
  searchParams: Promise<{
    next?: string;
  }>;
};

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  if (await getAuthToken()) {
    redirect("/workspace");
  }

  const params = await searchParams;
  const nextPath = params.next?.startsWith("/") ? params.next : "/workspace";

  return <AuthFrame form={<AuthForm mode="register" nextPath={nextPath} />} />;
}
