import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DesignClient from "./design-client";

export const metadata = {
  title: "Thiết kế mẫu giấy khen | Admin",
};

export default async function TemplateDesignPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const { id } = await params;
  const template = await prisma.certificateTemplate.findUnique({
    where: { id },
  });

  if (!template) {
    redirect("/admin/templates");
  }

  return (
    <div className="h-full -m-4 md:-m-8">
      <DesignClient template={template} />
    </div>
  );
}
