"use client";

import { Star } from "lucide-react";

type Testimonial = {
  quote: string;
  name: string;
  role: string;
};

const TESTIMONIALS: Record<string, Testimonial[]> = {
  en: [
    {
      quote: "Smooth order and payment. The lamb was exactly as described. Will order again for Eid.",
      name: "Ahmad R.",
      role: "Kuala Lumpur",
    },
    {
      quote: "First time ordering Aqiqah online. Very professional and the video proof gave us peace of mind.",
      name: "Siti M.",
      role: "Selangor",
    },
    {
      quote: "Halal and traceable from start to finish. Payment was secure and confirmation was quick.",
      name: "Lee K.",
      role: "Johor",
    },
    {
      quote: "We used Kordoba for Qurban. Delivery on time and meat was well packed. Highly recommend.",
      name: "Fatima H.",
      role: "Penang",
    },
  ],
  ar: [
    {
      quote: "طلب ودفع سلس. الخروف كان كما هو موصوف. سأطلب مرة أخرى في العيد.",
      name: "أحمد ر.",
      role: "كوالا لومبور",
    },
    {
      quote: "أول مرة أطلب العقيقة أونلاين. احترافية عالية وفيديو الإثبات أطمأننا.",
      name: "سيتي م.",
      role: "سيلانغور",
    },
    {
      quote: "حلال وقابل للتتبع من البداية للنهاية. الدفع آمن والتأكيد كان سريعاً.",
      name: "لي ك.",
      role: "جوهور",
    },
    {
      quote: "استخدمنا قرطبة للأضحية. التوصيل في الموعد واللحم مغلف جيداً. أنصح بشدة.",
      name: "فاطمة ح.",
      role: "بينانغ",
    },
  ],
  ms: [
    {
      quote: "Pesanan dan bayaran lancar. Daging kambing seperti yang dijelaskan. Akan order lagi untuk Raya.",
      name: "Ahmad R.",
      role: "Kuala Lumpur",
    },
    {
      quote: "Kali pertama order Aqiqah dalam talian. Sangat profesional dan video bukti memberi ketenangan.",
      name: "Siti M.",
      role: "Selangor",
    },
    {
      quote: "Halal dan boleh dijejak dari mula hingga akhir. Bayaran selamat dan pengesahan cepat.",
      name: "Lee K.",
      role: "Johor",
    },
    {
      quote: "Kami guna Kordoba untuk Korban. Penghantaran tepat masa dan daging dibungkus kemas. Sangat disyorkan.",
      name: "Fatima H.",
      role: "Penang",
    },
  ],
  zh: [
    {
      quote: "下单和支付都很顺畅。羊肉和描述一致。开斋节会再订。",
      name: "Ahmad R.",
      role: "吉隆坡",
    },
    {
      quote: "第一次在网上订阿奇卡。很专业，屠宰视频让我们很放心。",
      name: "Siti M.",
      role: "雪兰莪",
    },
    {
      quote: "从始至终清真可追溯。支付安全，确认也很快。",
      name: "Lee K.",
      role: "柔佛",
    },
    {
      quote: "我们用 Kordoba 做古尔邦。准时送达，肉质包装很好。强烈推荐。",
      name: "Fatima H.",
      role: "槟城",
    },
  ],
};

const SECTION_TITLE: Record<string, string> = {
  en: "What our customers say",
  ar: "ماذا يقول عملاؤنا",
  ms: "Apa kata pelanggan kami",
  zh: "客户评价",
};

export function Testimonials({ locale }: { locale: string }) {
  const loc = locale in TESTIMONIALS ? locale : "en";
  const list = TESTIMONIALS[loc] ?? TESTIMONIALS.en;
  const title = SECTION_TITLE[loc] ?? SECTION_TITLE.en;

  return (
    <section className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-10" aria-labelledby="testimonials-heading">
      <h2 id="testimonials-heading" className="mb-6 text-center text-lg font-semibold text-[var(--foreground)] sm:text-xl">
        {title}
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {list.map((t, i) => (
          <blockquote
            key={i}
            className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm sm:p-5"
          >
            <div className="flex gap-0.5 text-[var(--primary)]" aria-hidden>
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="h-4 w-4 fill-current" aria-hidden />
              ))}
            </div>
            <p className="mt-3 text-sm leading-relaxed text-[var(--foreground)]">
              &ldquo;{t.quote}&rdquo;
            </p>
            <footer className="mt-3 text-xs text-[var(--muted-foreground)]">
              — {t.name}, {t.role}
            </footer>
          </blockquote>
        ))}
      </div>
    </section>
  );
}
