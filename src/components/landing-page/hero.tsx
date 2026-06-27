import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, CirclePlay } from "lucide-react";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";

const Hero = () => {
  const t = useTranslations("Hero");

  return (
    <div className="min-h-[calc(100vh-4rem)] w-full flex items-center justify-center overflow-hidden border-b border-accent">
      <div className="max-w-(--breakpoint-xl) w-full flex flex-col lg:flex-row mx-auto items-center justify-between gap-y-14 gap-x-10 px-6 py-12 lg:py-0">
        <div className="max-w-xl">
          <h1 className="mt-6 max-w-[20ch] text-4xl xs:text-5xl sm:text-6xl lg:text-[4rem] xl:text-7xl font-bold leading-[1.1]! tracking-tight">
            {t.rich("title", {
              br: () => <br />,
              highlight: (chunks) => (
                <span style={{ color: "oklch(0.4778 0.1356 251.8383)" }}>
                  {chunks}
                </span>
              )
            })}
          </h1>
          <p className="mt-6 max-w-[60ch] xs:text-lg">
            {t("description")}
          </p>
          <div className="mt-12 flex flex-col sm:flex-row items-center gap-4">
            <Button
              size="lg"
              className="w-full sm:w-auto rounded-full text-base"
              asChild
            >
              <Link href="/dashboard/overview">
                {t("getStarted")} <ArrowUpRight className="h-5! w-5!" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto rounded-full text-base shadow-none"
            >
              <CirclePlay className="h-5! w-5!" /> {t("watchDemo")}
            </Button>
          </div>
        </div>
        <div className="relative lg:max-w-lg xl:max-w-xl w-full bg-accent rounded-xl aspect-square">
          <video
            src="/Uration.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover rounded-xl"
          />
        </div>
      </div>
    </div>
  );
};

export default Hero;
