type Props = {
  locale: string;
};

export function HowItWorks({ locale }: Props) {
  const isAr = locale === "ar";
  const isMs = locale === "ms";
  const isZh = locale === "zh";

  const steps = isAr
    ? [
        {
          title: "اختر المناسبة",
          body: "حدّد هل الطلب للأضحية، العقيقة، أو لحم ضاني شخصي.",
        },
        {
          title: "اختر الوزن والقطع",
          body: "اختر نطاق الوزن المناسب والقطع المطلوبة مثل ثلاجة، صالونه أو برياني.",
        },
        {
          title: "ننفّذ الذبح حسب الشريعة",
          body: "يتم الذبح من قبل ذبّاحين مسلمين مع الالتزام بالعمر والوزن الشرعي، ويمكنك طلب فيديو إثبات.",
        },
        {
          title: "التوصيل أو التبرع",
          body: "نرتّب التوصيل إلى عنوانك أو نتولى توزيع اللحم كصدقة عنك.",
        },
      ]
    : isMs
      ? [
          {
            title: "Pilih acara",
            body: "Tentukan sama ada pesanan untuk Korban, Aqiqah atau daging peribadi.",
          },
          {
            title: "Pilih berat & potongan",
            body: "Pilih julat berat yang sesuai dan potongan seperti ‘thallajah’, ‘salona’ atau ‘biryani’.",
          },
          {
            title: "Sembelihan ikut syariah",
            body: "Haiwan disembelih oleh penyembelih Muslim, mengikut umur & berat minima syariah. Video bukti boleh dipilih.",
          },
          {
            title: "Penghantaran atau derma",
            body: "Kami atur penghantaran ke alamat anda atau agihan derma bagi pihak anda.",
          },
        ]
      : isZh
        ? [
            {
              title: "选择场合",
              body: "确定订单用于古尔邦、阿奇卡还是家庭自用羊肉。",
            },
            {
              title: "选择重量与切割",
              body: "选择合适的重量区间以及切割方式，例如冷藏块、炖菜块或手抓饭块。",
            },
            {
              title: "按教法清真屠宰",
              body: "由穆斯林屠夫按教法屠宰，符合年龄与重量要求，可选屠宰视频证明。",
            },
            {
              title: "配送或慈善捐赠",
              body: "我们可送货上门，或代表您以善款形式分发肉类。",
            },
          ]
        : [
            {
              title: "Choose your occasion",
              body: "Decide if your order is for Qurban, Aqiqah or personal lamb.",
            },
            {
              title: "Select weight & cut",
              body: "Pick the weight band that fits your budget and the cut style such as fridge, salona or biryani.",
            },
            {
              title: "We slaughter according to Shariah",
              body: "Muslim slaughtermen follow Islamic requirements and age/weight conditions. You can request video proof.",
            },
            {
              title: "We deliver or donate",
              body: "We arrange delivery to your address or distribute the meat as charity on your behalf.",
            },
          ];

  return (
    <section className="mx-auto max-w-2xl px-4 pt-6 pb-6 sm:px-6 sm:pt-8 sm:pb-6">
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] px-4 py-4 shadow-sm sm:px-5 sm:py-4">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--primary)] sm:text-xs">
          {isAr
            ? "كيف تسير العملية"
            : isMs
              ? "Bagaimana proses berjalan"
              : isZh
                ? "流程简介"
                : "How it works"}
        </h2>
        <ol className="grid gap-3 text-xs text-[var(--muted-foreground)] sm:grid-cols-2 sm:text-sm">
          {steps.map((step, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-semibold">
                {idx + 1}
              </span>
              <div>
                <p className="text-[var(--foreground)] text-sm font-medium sm:text-sm">
                  {step.title}
                </p>
                <p className="mt-0.5 leading-snug">
                  {step.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

