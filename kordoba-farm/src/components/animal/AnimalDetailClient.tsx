"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import type { Animal } from "@prisma/client";
import { formatPrice, getProductLabel } from "@/lib/utils";

export function AnimalDetailClient({
  animal,
  locale,
  occasion,
}: {
  animal: Animal;
  locale: string;
  occasion?: string;
}) {
  const t = useTranslations("animal");
  const total = animal.weight * animal.pricePerKg;
  const [slaughterDate, setSlaughterDate] = useState("");
  const [distribution, setDistribution] = useState("delivery");
  const [nameTagOpt, setNameTagOpt] = useState(false);
  const [nameTag, setNameTag] = useState("");
  const [videoProof, setVideoProof] = useState(false);
  const [weightSelection, setWeightSelection] = useState("as_is");
  const [specialCut, setSpecialCut] = useState("");
  const [includeHead, setIncludeHead] = useState(false);
  const [includeStomach, setIncludeStomach] = useState(false);
  const [includeIntestines, setIncludeIntestines] = useState(false);
  const [note, setNote] = useState("");

  const canProceed =
    slaughterDate.trim() !== "" && weightSelection.trim() !== "";

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-[var(--muted)]">
            <Image
              src={animal.imageUrl}
              alt={animal.tagNumber}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          </div>
          {animal.videoUrl && (
            <div className="aspect-video rounded-xl bg-black">
              <video
                src={animal.videoUrl}
                controls
                className="h-full w-full object-contain"
                preload="metadata"
              />
            </div>
          )}
        </div>

        <div>
          <span className="rounded bg-[var(--primary)] px-2 py-0.5 text-xs font-medium text-white">
            {animal.breed}
          </span>
          <p className="mt-2 text-sm font-medium text-[var(--accent)]">
            {getProductLabel(animal.productType)}
          </p>
          <h1 className="mt-1 text-2xl font-bold text-[var(--foreground)]">
            Tag {animal.tagNumber}
          </h1>
          {animal.healthCertUrl && (
            <span className="mt-2 inline-flex items-center rounded border border-[var(--border)] px-2 py-1 text-xs">
              ✓ {t("healthCert")}
            </span>
          )}
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-[var(--muted-foreground)]">{t("weight")}</dt>
              <dd className="font-medium">{animal.weight} kg</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[var(--muted-foreground)]">{t("pricePerKg")}</dt>
              <dd className="font-medium">{formatPrice(animal.pricePerKg)}</dd>
            </div>
            <div className="flex justify-between text-lg">
              <dt className="text-[var(--muted-foreground)]">{t("totalPrice")}</dt>
              <dd className="font-bold text-[var(--primary)]">{formatPrice(total)}</dd>
            </div>
          </dl>

          <div className="mt-6 space-y-4 rounded-xl border border-[var(--border)] p-4">
            <div>
              <label className="mb-1 block text-sm font-medium">{t("slaughterDate")}</label>
              <input
                type="date"
                className="input-base w-full"
                value={slaughterDate}
                onChange={(e) => setSlaughterDate(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">{t("distribution")}</label>
              <select
                className="input-base w-full"
                value={distribution}
                onChange={(e) => setDistribution(e.target.value)}
              >
                <option value="delivery">Delivery</option>
                <option value="pickup">Pickup</option>
                <option value="donate">Donate</option>
              </select>
            </div>
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={nameTagOpt}
                  onChange={(e) => setNameTagOpt(e.target.checked)}
                />
                <span className="text-sm">{t("nameTag")}</span>
              </label>
              {nameTagOpt && (
                <input
                  type="text"
                  placeholder="Name on tag"
                  className="input-base mt-1 w-full"
                  value={nameTag}
                  onChange={(e) => setNameTag(e.target.value)}
                />
              )}
            </div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={videoProof}
                onChange={(e) => setVideoProof(e.target.checked)}
              />
              <span className="text-sm">{t("videoProof")}</span>
            </label>

            <div>
              <label className="mb-1 block text-sm font-medium">{t("weightSelection")}</label>
              <select
                className="input-base w-full"
                value={weightSelection}
                onChange={(e) => setWeightSelection(e.target.value)}
              >
                <option value="as_is">{t("weightAsIs", { weight: animal.weight })}</option>
                <option value="range">Weight range (contact us)</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">{t("specialCut")}</label>
              <input
                type="text"
                className="input-base w-full"
                value={specialCut}
                onChange={(e) => setSpecialCut(e.target.value)}
                placeholder="e.g. Leg cut, shoulder cut"
              />
            </div>
            <div>
              <p className="mb-2 text-sm font-medium">{t("orderIncludes")}</p>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={includeHead} onChange={(e) => setIncludeHead(e.target.checked)} />
                <span className="text-sm">{t("includeHead")}</span>
              </label>
              <label className="mt-1 flex items-center gap-2">
                <input type="checkbox" checked={includeStomach} onChange={(e) => setIncludeStomach(e.target.checked)} />
                <span className="text-sm">{t("includeStomach")}</span>
              </label>
              <label className="mt-1 flex items-center gap-2">
                <input type="checkbox" checked={includeIntestines} onChange={(e) => setIncludeIntestines(e.target.checked)} />
                <span className="text-sm">{t("includeIntestines")}</span>
              </label>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">{t("note")}</label>
              <textarea
                className="input-base w-full min-h-[80px] resize-y"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Any special requests..."
              />
            </div>
          </div>

          {canProceed ? (
            <Link
              href={`/${locale}/checkout?animal=${encodeURIComponent(animal.tagNumber)}${occasion ? `&occasion=${encodeURIComponent(occasion)}` : ""}&slaughter=${slaughterDate || "TBD"}&dist=${distribution}&nameTag=${encodeURIComponent(nameTagOpt ? nameTag : "")}&videoProof=${videoProof}&weightSel=${weightSelection}&specialCut=${encodeURIComponent(specialCut)}&head=${includeHead}&stomach=${includeStomach}&intestines=${includeIntestines}&note=${encodeURIComponent(note)}`}
              className="btn-primary mt-6 inline-flex w-full justify-center"
            >
              {t("addToOrder")}
            </Link>
          ) : (
            <div className="mt-6 space-y-2">
              <button
                type="button"
                disabled
                className="btn-primary inline-flex w-full cursor-not-allowed justify-center opacity-60"
              >
                {t("addToOrder")}
              </button>
              <p className="text-center text-sm text-[var(--muted-foreground)]">
                {t("completeRequiredToProceed")}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
