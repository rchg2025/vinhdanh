import { prisma } from "@/lib/prisma";
import CampaignsClient from "./CampaignsClient";

export default async function CampaignsAdminPage() {
  const campaigns = await prisma.campaign.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { applications: true } } }
  });

  return <CampaignsClient initialCampaigns={campaigns} />;
}
