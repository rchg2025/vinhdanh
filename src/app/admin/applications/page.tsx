import { prisma } from "@/lib/prisma";
import ApplicationsClient from "./ApplicationsClient";

export default async function AdminApplicationsPage({ searchParams }: { searchParams: Promise<{ campaignId?: string }> }) {
  const resolvedSearchParams = await searchParams;
  const where = resolvedSearchParams.campaignId ? { campaignId: resolvedSearchParams.campaignId } : {};

  const applications = await prisma.application.findMany({
    where,
    include: { user: true, campaign: true },
    orderBy: { createdAt: "desc" }
  });

  return <ApplicationsClient initialApplications={applications} />;
}
