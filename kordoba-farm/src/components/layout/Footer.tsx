import { useTranslations } from "next-intl";
import { BRAND_NAME } from "@/lib/constants";

const COMPANY_NAME = "Kordoba Agrotech Sdn. Bhd.";

export function Footer() {
  const t = useTranslations("footer");

  return (
    <footer
      className="mt-auto shrink-0 border-t border-[var(--border)] bg-[var(--card)]"
      style={{ paddingBottom: "var(--safe-bottom)" }}
    >
      <div
        className="mx-auto max-w-3xl px-4 py-5 sm:px-6 sm:py-6"
        style={{
          paddingInlineStart: "max(1rem, var(--safe-left))",
          paddingInlineEnd: "max(1rem, var(--safe-right))",
        }}
      >
        <div className="flex flex-col items-center gap-2 text-center">
          <span className="text-sm font-semibold text-[var(--primary)]">
            {BRAND_NAME}
          </span>
          <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
            © {new Date().getFullYear()} {COMPANY_NAME}. {t("allRights")}
          </p>
        </div>
      </div>
    </footer>
  );
}
