export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  console.log("--------------------------------------------------");
  console.log("[MOCK E-POSTA] Şifre sıfırlama");
  console.log(`Alıcı: ${email}`);
  console.log(`Bağlantı: ${resetUrl}`);
  console.log("--------------------------------------------------");
}
