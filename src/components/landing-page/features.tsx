import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Image from "next/image";
import {
  Banknote,
  Bot,
  ShieldCheck,
  CreditCard,
  BarChart3,
  Zap,
} from "lucide-react";
import { useTranslations } from "next-intl";

const Features = () => {
  const t = useTranslations("Features");

  const features = [
    {
      icon: CreditCard,
      title: t("items.payment.title"),
      description: t("items.payment.description"),
      image: "/E-Wallet-amico.svg",
    },
    {
      icon: ShieldCheck,
      title: t("items.gatekeeping.title"),
      description: t("items.gatekeeping.description"),
      image: "/Privacy policy-bro.svg",
    },
    {
      icon: Banknote,
      title: t("items.revenue.title"),
      description: t("items.revenue.description"),
      image: "/Revenue-bro.svg",
    },
    {
      icon: Zap,
      title: t("items.kick.title"),
      description: t("items.kick.description"),
      image: "/Inbox cleanup-cuate.svg",
    },
    {
      icon: BarChart3,
      title: t("items.analytics.title"),
      description: t("items.analytics.description"),
      image: "/Spreadsheets-pana.svg",
    },
    {
      icon: Bot,
      title: t("items.bot.title"),
      description: t("items.bot.description"),
      image: "/Chat bot-bro.svg",
    },
  ];

  return (
    <div
      id="features"
      className="max-w-(--breakpoint-xl) mx-auto w-full py-12 xs:py-20 px-6"
    >
      <h2 className="text-3xl xs:text-4xl md:text-5xl md:leading-[3.5rem] font-semibold tracking-tight sm:max-w-xl sm:text-center sm:mx-auto">
        {t("header")}
      </h2>
      <div className="mt-8 xs:mt-14 w-full mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-12">
        {features.map((feature) => (
          <Card
            key={feature.title}
            className="flex flex-col border rounded-xl overflow-hidden shadow-none"
          >
            <CardHeader>
              <feature.icon />
              <h4 className="mt-3! text-xl font-semibold tracking-tight">
                {feature.title}
              </h4>
              <p className="mt-1 text-muted-foreground text-sm xs:text-[17px]">
                {feature.description}
              </p>
            </CardHeader>
            <CardContent className="mt-auto px-0 pb-0">
              {feature.image ? (
                <div className="relative bg-muted h-52 ml-6 rounded-tl-xl overflow-hidden">
                  <Image
                    src={feature.image}
                    alt={feature.title}
                    fill
                    className="object-contain object-center scale-110"
                  />
                </div>
              ) : (
                <div className="bg-muted h-52 ml-6 rounded-tl-xl" />
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Features;
