export function getSpecialCutDisplayLabel(
  locale: string,
  id: string,
  fallbackLabel: string,
): string {
  const loc = locale || "en";
  const map: Record<string, Record<string, string>> = {
    arabic_8: {
      ar: "تقطيع عربى 8 قطع",
      en: "Arabic cut – 8 pieces",
      ms: "Potongan Arab – 8 bahagian",
      zh: "阿拉伯切法 – 8 块",
    },
    arabic_4: {
      ar: "تقطيع عربى 4 قطع",
      en: "Arabic cut – 4 pieces",
      ms: "Potongan Arab – 4 bahagian",
      zh: "阿拉伯切法 – 4 块",
    },
    arabic_half_length: {
      ar: "تقطيع عربى نص طول",
      en: "Arabic long cut",
      ms: "Potongan Arab memanjang",
      zh: "阿拉伯长条切法",
    },
    fridge_medium: {
      ar: "تقطيع ثلاجه (قطع متوسطة)",
      en: "Fridge cut (medium pieces)",
      ms: "Potongan peti sejuk (sederhana)",
      zh: "冷藏切块（中块）",
    },
    salona_small: {
      ar: "تقطيع صالونه (قطع صغيرة)",
      en: "Salona cut (small stew pieces)",
      ms: "Potongan salona (kecil untuk gulai)",
      zh: "沙洛娜炖菜切块（小块）",
    },
    biryani_large: {
      ar: "تقطيع برياني (قطع كبيرة)",
      en: "Biryani cut (large pieces)",
      ms: "Potongan briyani (besar)",
      zh: "手抓饭切块（大块）",
    },
    hadrami_joints: {
      ar: "حضرمي مفاصل",
      en: "Hadrami joints",
      ms: "Sendi Hadrami",
      zh: "哈德拉米关节切块",
    },
    maftah: {
      ar: "مفطح",
      en: "Maftah / mandi style",
      ms: "Maftah / mandi",
      zh: "马夫塔 / 曼迪风格切法",
    },
  };
  const byId = map[id];
  if (byId) {
    if (byId[loc]) return byId[loc];
    if (byId.en) return byId.en;
  }
  return fallbackLabel;
}

