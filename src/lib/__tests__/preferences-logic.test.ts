import { describe, expect, it } from "vitest";
import {
  getActivePreference,
  getNextQueuedPreference,
  hasAvailableQuota,
  isPreferenceExpired,
  ranksAreSequential,
  remainingQuota,
} from "../preferences-logic";

describe("kontenjan kontrolü", () => {
  it("lisans kotası dolduğunda yeni öğrenci alınamaz", () => {
    const input = {
      quotaLisans: 2,
      quotaYL: 3,
      assignedLisans: 2,
      assignedYL: 0,
      level: "LISANS" as const,
    };
    expect(remainingQuota(input)).toBe(0);
    expect(hasAvailableQuota(input)).toBe(false);
  });

  it("yüksek lisans kotası ayrı hesaplanır", () => {
    const input = {
      quotaLisans: 2,
      quotaYL: 1,
      assignedLisans: 2,
      assignedYL: 0,
      level: "YUKSEK_LISANS" as const,
    };
    expect(hasAvailableQuota(input)).toBe(true);
    expect(remainingQuota(input)).toBe(1);
  });
});

describe("tercih sırasının ilerlemesi", () => {
  const prefs = [
    { id: "1", rank: 1, status: "RED" as const, offeredAt: new Date() },
    { id: "2", rank: 2, status: "BEKLIYOR" as const, offeredAt: new Date() },
    { id: "3", rank: 3, status: "BEKLIYOR" as const, offeredAt: null },
  ];

  it("aktif tercih offeredAt dolu ve BEKLIYOR olan en düşük sıradır", () => {
    expect(getActivePreference(prefs)?.id).toBe("2");
  });

  it("reddedilen sıradan sonra kuyruktaki sonraki tercih bulunur", () => {
    expect(getNextQueuedPreference(prefs, 2)?.id).toBe("3");
  });

  it("7 gün dolunca tercih süresi dolmuş sayılır", () => {
    const eightDaysAgo = new Date(Date.now() - 8 * 86400000);
    expect(isPreferenceExpired(eightDaysAgo)).toBe(true);
    expect(isPreferenceExpired(new Date())).toBe(false);
  });

  it("sıralar 1-2-3 olmalıdır", () => {
    expect(ranksAreSequential([1, 2, 3])).toBe(true);
    expect(ranksAreSequential([1, 3])).toBe(false);
  });
});
