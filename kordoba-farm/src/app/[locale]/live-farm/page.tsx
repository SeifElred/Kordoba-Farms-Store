import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { buildPageMetadata, getCoreSeoKeywords, getLocalizedAreaSentence } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  if (locale === "ar") {
    return buildPageMetadata({
      locale,
      pathname: "/live-farm",
      title: "تجربة المزرعة الحية – الشفافية من المزرعة إلى التسليم",
      description:
        "اكتشف كيف نربي ونجهز الأنعام في مزارع قرطبة لخدمة عملاء ماليزيا وكوالالمبور وشيراس وأمبانغ وتامان ملاواتي وسردانغ وسري كمبانغان وسيبرجايا وبوتراجايا.",
      keywords: getCoreSeoKeywords(locale),
    });
  }
  if (locale === "ms") {
    return buildPageMetadata({
      locale,
      pathname: "/live-farm",
      title: "Pengalaman ladang langsung – ketelusan dari ladang ke penghantaran",
      description:
        "Lihat bagaimana ternakan diurus di Kordoba Farms untuk pelanggan di Malaysia, Kuala Lumpur, Cheras, Ampang, Taman Melawati, Serdang, Sri Kembangan, Cyberjaya dan Putrajaya.",
      keywords: getCoreSeoKeywords(locale),
    });
  }
  if (locale === "zh") {
    return buildPageMetadata({
      locale,
      pathname: "/live-farm",
      title: "牧场实况体验 – 从牧场到配送的透明流程",
      description:
        "了解 Kordoba Farms 如何为马来西亚、吉隆坡及蕉赖、安邦、塔曼美拉瓦蒂、沙登、史里肯邦安、赛城和布城客户管理牲畜与配送流程。",
      keywords: getCoreSeoKeywords(locale),
    });
  }
  return buildPageMetadata({
    locale,
    pathname: "/live-farm",
    title: "Live farm experience – transparency from farm to delivery",
    description:
      "See how Kordoba Farms manages livestock, halal handling, and delivery for customers across Malaysia, Kuala Lumpur, Cheras, Ampang, Taman Melawati, Serdang, Sri Kembangan, Cyberjaya, and Putrajaya.",
    keywords: getCoreSeoKeywords(locale),
  });
}

export default async function LiveFarmPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isAr = locale === "ar";
  const isMs = locale === "ms";
  const isZh = locale === "zh";

  return (
    <div className="mx-auto max-w-2xl py-12 sm:py-16">
      <h1 className="text-3xl font-bold text-[var(--primary)]">
        {isAr
          ? "تجربة المزرعة الحية"
          : isMs
            ? "Pengalaman ladang langsung"
            : isZh
              ? "牧场实况体验"
              : "Live Farm Experience"}
      </h1>
      <p className="mt-2 text-lg text-[var(--muted-foreground)]">
        {isAr
          ? "شفافية كاملة من المزرعة إلى التوصيل. شاهد كيف نعتني بحيوانك قبل الذبح والتجهيز."
          : isMs
            ? "Ketelusan penuh dari ladang hingga penghantaran. Lihat bagaimana haiwan anda dijaga sebelum sembelihan dan penyediaan."
            : isZh
              ? "从牧场到配送全程透明，了解我们如何在屠宰与处理前照料您的牲畜。"
              : "Transparency from farm to delivery. See how we raise and care for your animal before slaughter and preparation."}
      </p>

      <section className="mt-12 grid gap-12 md:grid-cols-2">
        <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-[var(--foreground)]">
            {isAr ? "جولة المزرعة والتصوير الجوي" : isMs ? "Lawatan ladang & rakaman dron" : isZh ? "牧场导览与无人机视角" : "Drone & Farm Tour"}
          </h2>
          <p className="mt-2 text-[var(--muted-foreground)]">
            {isAr
              ? "مشاهد جوية وأرضية لمرافقنا، مع مساحات مفتوحة وسكن نظيف وتتبّع كامل للحيوان."
              : isMs
                ? "Paparan udara dan darat kemudahan kami, dengan padang ragut terbuka, tempat tinggal bersih dan kebolehkesanan penuh."
                : isZh
                  ? "从空中与地面查看我们的设施，包括开放牧场、整洁栏舍与完整追踪流程。"
                  : "Aerial and on-ground views of our facilities, with open pastures, clean housing, and full traceability."}
          </p>
          <div className="mt-4 aspect-video rounded-lg bg-[var(--muted)]" />
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-[var(--foreground)]">
            {isAr ? "السلامة الحيوية" : isMs ? "Biosekuriti" : isZh ? "生物安全" : "Biosecurity"}
          </h2>
          <p className="mt-2 text-[var(--muted-foreground)]">
            {isAr
              ? "ضوابط دخول وفحوصات صحية وبروتوكولات عزل للحفاظ على سلامة الأنعام والعملاء."
              : isMs
                ? "Akses terkawal, pemeriksaan kesihatan dan protokol kuarantin untuk menjaga keselamatan ternakan serta pelanggan."
                : isZh
                  ? "通过受控访问、健康检查与隔离流程，保障牲畜与客户安全。"
                  : "Controlled access, health checks, and quarantine protocols to keep our livestock and customers safe."}
          </p>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-[var(--foreground)]">
            {isAr ? "برنامج التغذية" : isMs ? "Program pemakanan" : isZh ? "饲喂管理" : "Feeding Program"}
          </h2>
          <p className="mt-2 text-[var(--muted-foreground)]">
            {isAr
              ? "أعلاف متوازنة ومياه نظيفة ورعي طبيعي عند توفره لضمان جودة الحيوان."
              : isMs
                ? "Makanan seimbang, air bersih dan ragutan semula jadi apabila sesuai untuk memastikan kualiti ternakan."
                : isZh
                  ? "通过均衡饲料、洁净饮水与适当自然放牧来维持牲畜品质。"
                  : "Nutritionally balanced feed, clean water, and natural grazing where suitable."}
          </p>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-[var(--foreground)]">
            {isAr ? "الإشراف البيطري" : isMs ? "Pemantauan veterinar" : isZh ? "兽医监督" : "Veterinary Supervision"}
          </h2>
          <p className="mt-2 text-[var(--muted-foreground)]">
            {isAr
              ? "متابعة صحية مستمرة ورعاية بيطرية منتظمة مع شهادات صحية للحيوانات."
              : isMs
                ? "Pemantauan kesihatan berkala dan penjagaan veterinar dengan sijil kesihatan untuk haiwan."
                : isZh
                  ? "提供定期健康监测与兽医护理，并为牲畜准备健康证明。"
                  : "Regular health monitoring and veterinary care, with health certificates for the animals."}
          </p>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm md:col-span-2">
          <h2 className="text-xl font-semibold text-[var(--foreground)]">
            {isAr ? "الالتزام بالحلال" : isMs ? "Pematuhan halal" : isZh ? "清真合规" : "Halal Compliance"}
          </h2>
          <p className="mt-2 text-[var(--muted-foreground)]">
            {isAr
              ? "ذبح متوافق مع الشريعة وسلسلة عهدة كاملة، مع العمل مع جهات معتمدة للأضاحي والعقائق."
              : isMs
                ? "Sembelihan patuh syariah, rantaian penjagaan lengkap dan kerjasama dengan pihak bertauliah untuk Korban dan Aqiqah."
                : isZh
                  ? "遵循教法屠宰，具备完整的监管链，并与合规机构合作处理古尔邦与阿奇卡。"
                  : "Shariah-compliant slaughter, full chain of custody, and coordination with certified authorities for Qurban and Aqiqah."}
          </p>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm md:col-span-2">
          <h2 className="text-xl font-semibold text-[var(--foreground)]">
            {isAr ? "التغطية والتوصيل" : isMs ? "Liputan & penghantaran" : isZh ? "配送覆盖范围" : "Coverage & delivery"}
          </h2>
          <p className="mt-2 text-[var(--muted-foreground)]">
            {getLocalizedAreaSentence(locale)}
          </p>
        </div>
      </section>
    </div>
  );
}
