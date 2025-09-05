"use client";

import { Button } from "@nextui-org/react";
import { signIn } from "@/providers/auth";
import { useTranslations } from "next-intl";

export default function () {
  const t = useTranslations("Nav");
  
  const handleSignIn = async () => {
    await signIn.social({
      provider: "google",
      callbackURL: "/dashboard",
    });
  };

  return (
    <Button
      className="capitalize text-black rounded-full"
      onClick={handleSignIn}
    >
      {t("login")}
    </Button>
  );
}
