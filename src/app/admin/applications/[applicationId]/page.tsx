import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import ApplicationReviewClient from "./review-client";

export default async function ApplicationDetailsPage({ params }: { params: { applicationId: string } }) {
  const application = await prisma.application.findUnique({
    where: { id: params.applicationId },
    include: { user: true, campaign: true }
  });

  if (!application) return notFound();

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
                <strong>Minh chứng:</strong>
                <ul className="list-disc pl-5 mt-1">
                  {(application.evidenceFiles as string[]).map((url, i) => (
                    <li key={i}>
                      <a href={url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">Xem File Minh Chứng {i+1}</a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <ApplicationReviewClient application={application} />
    </div>
  );
}
