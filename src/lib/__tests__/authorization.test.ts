import { describe, expect, it } from "vitest";

function canAdvisorAccessStudent(advisorId: string, studentAdvisorId: string | null) {
  return studentAdvisorId === advisorId;
}

function canStudentAccessThesis(studentId: string, thesisStudentId: string, role: string) {
  if (role === "YONETICI") return true;
  if (role === "OGRENCI") return studentId === thesisStudentId;
  return false;
}

describe("yetki kontrolleri", () => {
  it("danışman kendisine bağlı olmayan öğrenciyi göremez", () => {
    expect(canAdvisorAccessStudent("adv-1", "adv-2")).toBe(false);
    expect(canAdvisorAccessStudent("adv-1", "adv-1")).toBe(true);
  });

  it("öğrenci başka öğrencinin tezine erişemez", () => {
    expect(canStudentAccessThesis("s1", "s2", "OGRENCI")).toBe(false);
    expect(canStudentAccessThesis("s1", "s1", "OGRENCI")).toBe(true);
    expect(canStudentAccessThesis("s1", "s2", "YONETICI")).toBe(true);
  });
});
