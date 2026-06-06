import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import CertificateViewClient from "./certificate-view-client";

export default async function CertificatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const application = await prisma.application.findUnique({
    where: { id },
    include: {
      user: true,
      campaign: true,
    },
  });

  if (!application || application.status !== "APPROVED") {
    notFound();
  }

  const template = application.campaign.templateUrl
    ? await prisma.certificateTemplate.findFirst({
        where: { imageUrl: application.campaign.templateUrl },
      })
    : null;

  return (
    <CertificateViewClient
      application={JSON.parse(JSON.stringify(application))}
      template={JSON.parse(JSON.stringify(template))}
    />
  );
}
