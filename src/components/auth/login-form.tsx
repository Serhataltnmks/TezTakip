"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginSchema } from "@/lib/validations";

type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm({
  intendedRole,
  registerHref,
  callbackUrl,
}: {
  intendedRole: LoginValues["intendedRole"];
  registerHref?: string;
  callbackUrl: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", intendedRole },
  });

  async function onSubmit(values: LoginValues) {
    setLoading(true);
    const result = await signIn("credentials", {
      email: values.email,
      password: values.password,
      intendedRole,
      redirect: false,
    });
    setLoading(false);

    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Giriş başarılı");
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
      <input type="hidden" {...form.register("intendedRole")} />
      <div className="space-y-2">
        <Label htmlFor="email">E-posta</Label>
        <Input id="email" type="email" autoComplete="email" {...form.register("email")} />
        {form.formState.errors.email && (
          <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Şifre</Label>
        <Input id="password" type="password" autoComplete="current-password" {...form.register("password")} />
        {form.formState.errors.password && (
          <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
        )}
      </div>
      <Button type="submit" className="w-full" size="lg" disabled={loading}>
        {loading ? "Giriş yapılıyor..." : "Giriş yap"}
      </Button>
      <div className="flex flex-col gap-2 text-center text-sm">
        <Link href="/sifremi-unuttum" className="text-muted-foreground hover:underline">
          Şifremi unuttum
        </Link>
        {registerHref && (
          <Link href={registerHref} className="font-medium text-primary hover:underline">
            Hesabın yok mu? Kayıt ol
          </Link>
        )}
      </div>
    </form>
  );
}
