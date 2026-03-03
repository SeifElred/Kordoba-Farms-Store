import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (locale === "ar") {
    return {
      title: "عن مزارع قرطبة – الذبح الحلال من المزرعة إلى بيتك",
      description:
        "تعرّف على مزارع قرطبة: أضاحي وعقائق وذبائح شخصية مع تتبّع كامل، ذبح شرعي، وفيديو إثبات واختيارات للتوصيل أو التبرع.",
    };
  }
  if (locale === "ms") {
    return {
      title: "Tentang Kordoba Farms – Halal dari ladang ke rumah anda",
      description:
        "Ketahui tentang Kordoba Farms: Korban, Aqiqah dan sembelihan peribadi dengan kebolehkesanan penuh, sembelihan halal dan pilihan video bukti.",
    };
  }
  if (locale === "zh") {
    return {
      title: "关于科尔多巴农场 – 从牧场到您家门口的清真屠宰",
      description:
        "了解科尔多巴农场：提供古尔邦、阿奇卡和家庭自用清真羊肉，全程可追溯，遵循教法屠宰，并可提供屠宰视频证明。",
    };
  }
  return {
    title: "About Kordoba Farms – Halal from farm to home",
    description:
      "Learn about Kordoba Farms: Qurban, Aqiqah and personal lamb with full traceability, Shariah-compliant slaughter and optional video proof.",
  };
}

export default async function AboutPage({
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
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8 space-y-8">
      <section className="space-y-3">
        <h1 className="text-2xl font-bold text-[var(--foreground)] sm:text-3xl">
          {isAr
            ? "عن مزارع قرطبة"
            : isMs
              ? "Tentang Kordoba Farms"
              : isZh
                ? "关于科尔多巴农场"
                : "About Kordoba Farms"}
        </h1>
        <p className="text-sm leading-relaxed text-[var(--muted-foreground)] sm:text-base">
          {isAr
            ? "مزارع قرطبة منصة متخصصة في تقديم الأضاحي والعقائق والذبائح الشخصية بطريقة منظمة وسهلة، مع عناية كاملة بالحيوان من المزرعة حتى باب بيتك."
            : isMs
              ? "Kordoba Farms ialah platform khusus untuk Korban, Aqiqah dan sembelihan peribadi, dengan pengurusan binatang yang terjaga dari ladang sehingga ke pintu rumah anda."
              : isZh
                ? "科尔多巴农场专注于古尔邦、阿奇卡和家庭自用牲畜，从牧场到您家门口，全程用心管理。"
                : "Kordoba Farms is a dedicated platform for Qurban, Aqiqah and personal lamb orders, taking care of each animal from the farm all the way to your doorstep."}
        </p>
      </section>

      <section className="space-y-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 sm:p-5">
        <h2 className="text-lg font-semibold text-[var(--foreground)] sm:text-xl">
          {isAr
            ? "الذبح الحلال وفق الشريعة"
            : isMs
              ? "Sembelihan halal mengikut syariah"
              : isZh
                ? "遵循教法的清真屠宰"
                : "Halal slaughter according to Shariah"}
        </h2>
        <ul className="space-y-2 text-sm leading-relaxed text-[var(--muted-foreground)] sm:text-base">
          <li>
            {isAr
              ? "• الذبح يتم على يد ذبّاحين مسلمين، مع التسمية واستقبال القبلة والتأكد من سلامة السكين."
              : isMs
                ? "• Sembelihan dilakukan oleh penyembelih Muslim, dengan bismillah, menghadap kiblat dan pisau yang tajam."
                : isZh
                  ? "• 由穆斯林屠夫操作，念“奉安拉之名”，面向朝向，并使用锋利刀具。"
                  : "• All slaughter is performed by Muslim slaughtermen, with bismillah, facing the qiblah and using a properly sharpened knife."}
          </li>
          <li>
            {isAr
              ? "• نلتزم بالعمر والوزن الشرعي للأضحية والعقيقة كما هو مذكور في صفحة الطلب."
              : isMs
                ? "• Kami mematuhi umur dan berat minimum yang disyaratkan syariah untuk Korban dan Aqiqah seperti dalam aliran pesanan."
                : isZh
                  ? "• 我们遵守古尔邦和阿奇卡规定的最低年龄和重量要求，具体见下单流程中的说明。"
                  : "• We follow the minimum age and weight conditions for Qurban and Aqiqah as shown in the order flow."}
          </li>
          <li>
            {isAr
              ? "• يمكنك اختيار فيديو إثبات الذبح ليصلك رابط الفيديو بعد تنفيذ الطلب."
              : isMs
                ? "• Anda boleh pilih untuk menerima video bukti sembelihan; pautan video akan dihantar selepas sembelihan."
                : isZh
                  ? "• 您可选择获取屠宰视频证明，我们会在完成后发送视频链接。"
                  : "• You can opt in for video proof of slaughter; we’ll send you a video link after your order is fulfilled."}
          </li>
        </ul>
      </section>

      <section className="space-y-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 sm:p-5">
        <h2 className="text-lg font-semibold text-[var(--foreground)] sm:text-xl">
          {isAr
            ? "من المزرعة إلى بيتك"
            : isMs
              ? "Dari ladang ke rumah anda"
              : isZh
                ? "从牧场到您家门口"
                : "From farm to your home"}
        </h2>
        <ul className="space-y-2 text-sm leading-relaxed text-[var(--muted-foreground)] sm:text-base">
          <li>
            {isAr
              ? "• نعمل مع مزارع موثوقة تلتزم برفاهية الحيوان والتغذية السليمة."
              : isMs
                ? "• Kami bekerjasama dengan ladang yang dipercayai yang menjaga kebajikan haiwan dan pemakanan yang baik."
                : isZh
                  ? "• 我们与可信赖的本地牧场合作，重视动物福利和饲养质量。"
                  : "• We partner with trusted local farms that prioritise animal welfare and proper feeding."}
          </li>
          <li>
            {isAr
              ? "• تتبع كامل للحيوان من اختيارك وحتى الذبح والتغليف والتسليم."
              : isMs
                ? "• Kebolehkesanan penuh dari pemilihan haiwan, sembelihan, pembungkusan hingga penghantaran."
                : isZh
                  ? "• 从您选择牲畜到屠宰、包装和配送，全程可追溯。"
                  : "• Full traceability from the animal you select through slaughter, packing and delivery."}
          </li>
          <li>
            {isAr
              ? "• خيارات للتوصيل إلى باب بيتك أو التبرع نيابةً عنك."
              : isMs
                ? "• Pilihan penghantaran ke pintu rumah anda atau derma bagi pihak anda."
                : isZh
                  ? "• 可选择送货上门，或代表您进行慈善捐赠分发。"
                  : "• Options to deliver to your doorstep or to donate on your behalf."}
          </li>
        </ul>
      </section>
    </div>
  );
}

