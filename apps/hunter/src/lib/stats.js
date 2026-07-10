import { PROGRAMS } from "../data/programs";

export const totalCashLikeT1 = PROGRAMS
  .filter((p) => p.tier === 1 && p.value.counted && p.value.cashLike)
  .reduce((sum, p) => sum + p.value.estimate, 0);

export const totalCountedT1 = PROGRAMS
  .filter((p) => p.tier === 1 && p.value.counted)
  .reduce((sum, p) => sum + p.value.estimate, 0);

export const VENDOR_INFO = PROGRAMS.reduce((map, p) => {
  if (!map[p.vendor]) {
    map[p.vendor] = { name: p.vendor, programs: [], cashLike: 0, counted: 0, count: 0 };
  }
  map[p.vendor].programs.push(p);
  map[p.vendor].count += 1;
  if (p.value.counted) map[p.vendor].counted += p.value.estimate;
  if (p.value.counted && p.value.cashLike) map[p.vendor].cashLike += p.value.estimate;
  return map;
}, {});

export const VENDOR_COUNT = Object.keys(VENDOR_INFO).length;

export const MULTI_VENDORS = Object.values(VENDOR_INFO).filter((v) => v.count > 1).length;
