"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, LoaderCircle, LockKeyhole, Mail } from "lucide-react";

import { useT } from "@/hooks/i18n/useT";
import { loginSchema, type LoginInput } from "@/lib/auth/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signInWithPassword } from "@/app/actions/auth/signInWithPassword";

export function LoginForm({ next }: { next?: string }) {
  const t = useT();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = (values: LoginInput) => {
    setServerError(null);
    startTransition(async () => {
      // Server Action redirects on success — no return value reaches here.
      // On failure, an error discriminator is returned and rendered inline.
      const res = await signInWithPassword(values, next);
      if (!res) {
        // Should be unreachable (redirect throws), but guard anyway.
        router.replace(next || "/app");
        return;
      }
      if (res.error === "mfa_required") {
        const params = new URLSearchParams();
        if (next) params.set("next", next);
        if (res.challengeId) params.set("factor", res.challengeId);
        router.replace(`/login/mfa${params.toString() ? `?${params}` : ""}`);
        return;
      }
      if (res.error === "invalid_credentials") {
        setServerError(t("Email ou senha incorretos."));
      } else if (res.error === "rate_limited") {
        setServerError(t("Muitas tentativas. Aguarde alguns minutos."));
      } else if (res.error === "validation_error") {
        setServerError(t("Dados inválidos. Confira os campos."));
      } else {
        setServerError(t("Erro inesperado. Tente novamente."));
      }
    });
  };

  return (
    <form method="post" onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <div className="space-y-2">
        <Label htmlFor="email" className="text-slate-200">
          Email
        </Label>
        <div className="relative">
          <Mail
            className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-slate-500"
            aria-hidden="true"
          />
          <Input
            id="email"
            type="email"
            autoComplete="email"
            autoFocus
            placeholder="voce@empresa.com"
            className="h-12 rounded-xl border-white/10 bg-[#08111f]/75 pl-11 text-white placeholder:text-slate-600 focus-visible:border-sky-400/70 focus-visible:ring-sky-400/20"
            aria-invalid={errors.email ? true : undefined}
            {...register("email")}
          />
        </div>
        {errors.email && (
          <p className="text-xs text-destructive">{t(errors.email.message ?? "")}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="password" className="text-slate-200">
          {t("Senha")}
        </Label>
        <div className="relative">
          <LockKeyhole
            className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-slate-500"
            aria-hidden="true"
          />
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="Sua senha"
            className="h-12 rounded-xl border-white/10 bg-[#08111f]/75 pl-11 text-white placeholder:text-slate-600 focus-visible:border-sky-400/70 focus-visible:ring-sky-400/20"
            aria-invalid={errors.password ? true : undefined}
            {...register("password")}
          />
        </div>
        {errors.password && (
          <p className="text-xs text-destructive">{t(errors.password.message ?? "")}</p>
        )}
      </div>
      {serverError && (
        <div
          className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          role="alert"
        >
          {serverError}
        </div>
      )}
      <Button
        type="submit"
        className="group h-12 w-full rounded-xl bg-sky-600 font-bold text-white shadow-lg shadow-sky-950/40 transition-[transform,background-color,box-shadow] hover:-translate-y-0.5 hover:bg-sky-500 hover:shadow-sky-900/50 focus-visible:ring-sky-300 active:translate-y-0"
        disabled={isPending}
      >
        {isPending ? (
          <>
            <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
            {t("Entrando...")}
          </>
        ) : (
          <>
            {t("Entrar")}
            <ArrowRight
              className="h-4 w-4 transition-transform group-hover:translate-x-1"
              aria-hidden="true"
            />
          </>
        )}
      </Button>
    </form>
  );
}
