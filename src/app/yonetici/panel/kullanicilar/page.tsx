import { PageHeader } from "@/components/page-header";
import { UserActiveToggle } from "@/components/admin/user-active-toggle";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { roleLabel } from "@/lib/labels";
import { fullName } from "@/lib/utils";

export default async function UsersPage() {
  await requireRole("YONETICI");
  const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <PageHeader title="Kullanıcı yönetimi" description="Hesapları aktif veya pasif yapın." />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ad</TableHead>
            <TableHead>E-posta</TableHead>
            <TableHead>Rol</TableHead>
            <TableHead>Durum</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((u) => (
            <TableRow key={u.id}>
              <TableCell>{fullName(u.firstName, u.lastName)}</TableCell>
              <TableCell>{u.email}</TableCell>
              <TableCell>
                <Badge variant="outline">{roleLabel[u.role]}</Badge>
              </TableCell>
              <TableCell>{u.isActive ? "Aktif" : "Pasif"}</TableCell>
              <TableCell>
                <UserActiveToggle userId={u.id} isActive={u.isActive} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
