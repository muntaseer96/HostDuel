import { redirect } from 'next/navigation';
import { getCompanyById } from '@/lib/data';
import { getAffiliateUrl } from '@/lib/affiliates';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ hostId: string }> }
) {
  const { hostId } = await params;

  // Check for active affiliate link first
  const affiliateUrl = getAffiliateUrl(hostId);
  if (affiliateUrl) {
    redirect(affiliateUrl);
  }

  // Fallback to official website
  const company = await getCompanyById(hostId);
  if (company?.basicInfo.websiteUrl) {
    redirect(company.basicInfo.websiteUrl);
  }

  // Host not found - redirect to homepage
  redirect('/');
}
