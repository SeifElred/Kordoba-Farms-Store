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
      pathname: "/corporate",
      title: "كوردوبا أغروتيك – حلول أضاحي وعقائق للشركات في ماليزيا",
      description:
        "حلول أضاحي وعقائق وبرامج توزيع مؤسسية من كوردوبا أغروتيك في ماليزيا وكوالالمبور، مع تغطية موثوقة لشيراس وأمبانغ وتامان ملاواتي وسردانغ وسري كمبانغان وسيبرجايا وبوتراجايا.",
      keywords: getCoreSeoKeywords(locale),
    });
  }
  if (locale === "ms") {
    return buildPageMetadata({
      locale,
      pathname: "/corporate",
      title: "Kordoba Agrotech – Program Korban & Aqiqah korporat di Malaysia",
      description:
        "Program Korban, Aqiqah dan agihan institusi oleh Kordoba Agrotech di Malaysia dan Kuala Lumpur, termasuk liputan ke Cheras, Ampang, Taman Melawati, Serdang, Sri Kembangan, Cyberjaya dan Putrajaya.",
      keywords: getCoreSeoKeywords(locale),
    });
  }
  if (locale === "zh") {
    return buildPageMetadata({
      locale,
      pathname: "/corporate",
      title: "Kordoba Agrotech – 马来西亚企业古尔邦与阿奇卡方案",
      description:
        "Kordoba Agrotech 为马来西亚和吉隆坡企业、机构及社区项目提供古尔邦、阿奇卡与捐赠分发方案，并服务于蕉赖、安邦、塔曼美拉瓦蒂、沙登、史里肯邦安、赛城和布城。",
      keywords: getCoreSeoKeywords(locale),
    });
  }
  return buildPageMetadata({
    locale,
    pathname: "/corporate",
    title: "Kordoba Agrotech – Corporate Qurban & Aqiqah programs in Malaysia",
    description:
      "Corporate Qurban, Aqiqah, and donation distribution programs across Malaysia and Kuala Lumpur, with trusted service in Cheras, Ampang, Taman Melawati, Serdang, Sri Kembangan, Cyberjaya, and Putrajaya.",
    keywords: getCoreSeoKeywords(locale),
  });
}

export default async function CorporatePage({
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
          ? "كوردوبا أغروتيك ش.ذ.م.م"
          : isMs
            ? "KORDOBA AGROTECH SDN. BHD."
            : isZh
              ? "KORDOBA AGROTECH SDN. BHD."
              : "KORDOBA AGROTECH SDN. BHD."}
      </h1>
      <p className="mt-2 text-lg text-[var(--muted-foreground)]">
        {isAr
          ? "الشركة الأم لكوردوبا فارمز، وتقدم حلولاً متخصصة في الثروة الحيوانية والبرامج المؤسسية للأضاحي والعقائق في ماليزيا."
          : isMs
            ? "Syarikat induk Kordoba Farms yang menawarkan penyelesaian ternakan premium dan program Korban serta Aqiqah korporat di Malaysia."
            : isZh
              ? "Kordoba Farms 的母公司，为马来西亚市场提供优质畜牧与企业古尔邦、阿奇卡方案。"
              : "Parent company of Kordoba Farms, delivering premium livestock and corporate Qurban and Aqiqah programs in Malaysia."}
      </p>

      <section className="mt-12 space-y-10">
        <div>
          <h2 className="text-xl font-semibold text-[var(--foreground)]">
            {isAr ? "الرؤية" : isMs ? "Visi" : isZh ? "愿景" : "Vision"}
          </h2>
          <p className="mt-2 text-[var(--muted-foreground)]">
            {isAr
              ? "أن نكون الاسم الأكثر ثقة في حلول الأضاحي والعقائق والثروة الحيوانية الحلال في المنطقة، مع الجمع بين الأصالة والتقنية."
              : isMs
                ? "Menjadi nama paling dipercayai untuk penyelesaian ternakan halal serta Korban dan Aqiqah di rantau ini, dengan gabungan tradisi dan teknologi."
                : isZh
                  ? "成为本区域最值得信赖的清真牲畜、古尔邦与阿奇卡解决方案品牌，将传统与科技结合。"
                  : "To be the most trusted name in halal livestock and Qurban and Aqiqah solutions across the region, combining tradition with technology."}
          </p>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-[var(--foreground)]">
            {isAr ? "الرسالة" : isMs ? "Misi" : isZh ? "使命" : "Mission"}
          </h2>
          <p className="mt-2 text-[var(--muted-foreground)]">
            {isAr
              ? "تقديم أنعام عالية الجودة وقابلة للتتبع، مع تجربة رقمية سهلة وإشراف بيطري والتزام كامل بأحكام الشريعة."
              : isMs
                ? "Menyampaikan ternakan premium yang boleh dijejak, dengan pengalaman digital yang lancar, pemantauan veterinar dan pematuhan syariah sepenuhnya."
                : isZh
                  ? "提供高品质、可追溯的牲畜，并结合顺畅的数字化体验、兽医监督与完整的教法合规。"
                  : "Deliver traceable, premium-quality livestock with a seamless digital experience, veterinary oversight, and full Shariah compliance."}
          </p>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-[var(--foreground)]">
            {isAr ? "البنية التشغيلية" : isMs ? "Infrastruktur" : isZh ? "基础设施" : "Infrastructure"}
          </h2>
          <p className="mt-2 text-[var(--muted-foreground)]">
            {isAr
              ? "مرافق حديثة وسلسلة تبريد وشراكات توزيع تضمن وصول الطلب بحالة ممتازة إلى كوالالمبور والمناطق المحيطة."
              : isMs
                ? "Kemudahan ladang moden, rantaian sejuk dan rakan pengedaran untuk memastikan pesanan anda sampai dalam keadaan terbaik ke Kuala Lumpur dan kawasan sekitarnya."
                : isZh
                  ? "现代化农场设施、冷链与配送合作网络，确保订单以最佳状态送达吉隆坡及周边区域。"
                  : "Modern farm facilities, cold-chain handling, and distribution partnerships to ensure your order reaches Kuala Lumpur and surrounding areas in excellent condition."}
          </p>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-[var(--foreground)]">
            {isAr ? "الخبرة الإقليمية" : isMs ? "Pengalaman serantau" : isZh ? "区域经验" : "Regional experience"}
          </h2>
          <p className="mt-2 text-[var(--muted-foreground)]">
            {isAr
              ? "نخدم العملاء في ماليزيا وسنغافورة وبروناي وغيرها، مع تركيز قوي على كوالالمبور وشيراس وأمبانغ وتامان ملاواتي وسردانغ وسري كمبانغان وسيبرجايا وبوتراجايا."
              : isMs
                ? "Kami melayani pelanggan di Malaysia, Singapura, Brunei dan seterusnya, dengan tumpuan kuat di Kuala Lumpur, Cheras, Ampang, Taman Melawati, Serdang, Sri Kembangan, Cyberjaya dan Putrajaya."
                : isZh
                  ? "我们服务于马来西亚、新加坡、文莱等市场，并重点覆盖吉隆坡、蕉赖、安邦、塔曼美拉瓦蒂、沙登、史里肯邦安、赛城和布城。"
                  : "Serving customers across Malaysia, Singapore, Brunei, and beyond, with strong delivery coverage in Kuala Lumpur, Cheras, Ampang, Taman Melawati, Serdang, Sri Kembangan, Cyberjaya, and Putrajaya."}
          </p>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-[var(--foreground)]">
            {isAr ? "مناطق الخدمة الأساسية" : isMs ? "Kawasan perkhidmatan utama" : isZh ? "重点服务区域" : "Primary service areas"}
          </h2>
          <p className="mt-2 text-[var(--muted-foreground)]">
            {getLocalizedAreaSentence(locale)}
          </p>
        </div>
      </section>
    </div>
  );
}
