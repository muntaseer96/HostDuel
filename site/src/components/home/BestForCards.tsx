import Link from 'next/link';
import {
  PenTool,
  ShoppingCart,
  Briefcase,
  Code,
  GraduationCap,
  Building,
} from 'lucide-react';
import { Card, CardContent, Badge } from '@/components/ui';

const useCases = [
  {
    id: 'blogger',
    name: 'Bloggers',
    icon: PenTool,
    description: 'Perfect for personal blogs and content sites',
    color: 'text-pink-400',
    bgColor: 'bg-pink-500/10',
  },
  {
    id: 'ecommerce',
    name: 'eCommerce',
    icon: ShoppingCart,
    description: 'Optimized for online stores and WooCommerce',
    color: 'text-green-400',
    bgColor: 'bg-green-500/10',
  },
  {
    id: 'agency',
    name: 'Agencies',
    icon: Briefcase,
    description: 'Manage multiple client sites efficiently',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
  },
  {
    id: 'developer',
    name: 'Developers',
    icon: Code,
    description: 'SSH, Git, staging, and CLI access',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
  },
  {
    id: 'beginner',
    name: 'Beginners',
    icon: GraduationCap,
    description: 'Easy setup with great support',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/10',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    icon: Building,
    description: 'Compliance, SLAs, and dedicated support',
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10',
  },
];

export function BestForCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {useCases.map((useCase) => (
        <Link key={useCase.id} href={`/best-for/${useCase.id}`}>
          <Card hover className="h-full transition-transform hover:scale-[1.02]">
            <CardContent className="flex items-start gap-4">
              <div className={`rounded-lg p-3 ${useCase.bgColor}`}>
                <useCase.icon className={`h-6 w-6 ${useCase.color}`} />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{useCase.name}</h3>
                <p className="mt-1 text-sm text-text-secondary">{useCase.description}</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
