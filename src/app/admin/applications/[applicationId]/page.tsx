import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import ApplicationReviewClient from "./review-client";

function getDriveDisplayUrl(url: string): string {
  if (!url) return "";
  const viewMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)\//);
  if (viewMatch?.[1]) {
    const thumb = "https://drive.google.com/thumbnail?id=" + viewMatch[1] + "&sz=w800";
    return "/api/proxy-image?url=" + encodeURIComponent(thumb);
  }
  const ucMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (ucMatch?.[1] && url.includes("drive.google.com")) {
    const thumb = "https://drive.google.com/thumbnail?id=" + ucMatch[1] + "&sz=w800";
    return "/api/proxy-image?url=" + encodeURIComponent(thumb);
  }
  return url;
}
export default async function ApplicationDetailsPage({ params }: { params: Promise<{ applicationId: string }> }) {
  const { applicationId } = await params;
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: { user: true, campaign: true }
  });

  if (!application) return notFound();

  // Look up the CertificateTemplate whose imageUrl matches the campaign's templateUrl
  const template = application.campaign.templateUrl
    ? await prisma.certificateTemplate.findFirst({
        where: { imageUrl: application.campaign.templateUrl },
      })
    : null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = application.data as any;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Chi tiết Hồ sơ</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Thông tin Sinh viên</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {application.portraitImage && (
              <div className="flex justify-center mb-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getDriveDisplayUrl(application.portraitImage)}
                  alt="Ảnh đại diện"
                  className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-md"
                />
              </div>
            )}
            <p><strong>Họ tên:</strong> {application.user.name}</p>
            <p><strong>Mã SV:</strong> {application.user.studentId}</p>
            <p><strong>Email:</strong> {application.user.email}</p>
            <p><strong>Chi đoàn:</strong> {data?.unit}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Hồ sơ Xét duyệt</CardTitle>
            <CardDescription>Trạng thái hiện tại: {application.status}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <strong>Thành tích nổi bật:</strong>
              <p className="mt-1 p-3 bg-gray-50 rounded text-sm whitespace-pre-wrap">{data?.achievements}</p>
            </div>
            
            {application.evidenceFiles && (application.evidenceFiles as string[]).length > 0 && (
              <div>
                <strong>File minh chứng:</strong>
                <div className="mt-2 space-y-3">
                  {(application.evidenceFiles as string[]).map((url, i) => (
                    <div key={i} className="border border-gray-200 rounded-lg overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={getDriveDisplayUrl(url)}
                        alt={`Minh chứng ${i + 1}`}
                        className="w-full max-h-64 object-contain bg-gray-50"
                        onError={undefined}
                      />
                      <div className="px-3 py-2 bg-white border-t border-gray-100">
                        <a
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm text-blue-600 hover:underline"
                        >
                          ↗ Mở file minh chứng {i + 1} (Drive)
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <ApplicationReviewClient application={application} template={template} />
    </div>
  );
}
