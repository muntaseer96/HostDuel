'use client';

import Link from 'next/link';
import { ExternalLink, Check, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { trackHostClick } from '@/lib/tracking';
import { Badge, Button } from '@/components/ui';
import { HOSTING_TYPES, HOSTING_TYPE_COLORS, type HostingType } from '@/lib/constants';
import type { CompanyTableRow, ColumnSet } from '@/types';

interface HostRowProps {
  host: CompanyTableRow;
  isSelected: boolean;
  onToggleCompare: (id: string) => void;
  compareDisabled: boolean;
  columnSet: ColumnSet;
}

export function HostRow({ host, isSelected, onToggleCompare, compareDisabled, columnSet }: HostRowProps) {
  const formatPrice = (price: number | null) => {
    if (price === null) return 'N/A';
    return `$${price.toFixed(2)}`;
  };

  const formatStorage = (value: number | string | null) => {
    if (value === null) return 'N/A';
    if (value === 'Unlimited') return 'Unlimited';
    return `${value} GB`;
  };

  const getRatingBadge = (rating: number | null) => {
    if (rating === null) return <span className="text-text-muted">N/A</span>;
    const variant = rating >= 4 ? 'success' : rating >= 3 ? 'warning' : 'error';
    return <Badge variant={variant}>{rating.toFixed(1)}</Badge>;
  };

  const BooleanCell = ({ value }: { value: boolean | null }) => {
    if (value === null) return <span className="text-text-muted">—</span>;
    return value ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-text-muted" />
    );
  };

  const NumberCell = ({ value, suffix = '' }: { value: number | null; suffix?: string }) => {
    if (value === null) return <span className="text-text-muted">—</span>;
    return <span className="text-sm text-foreground">{value}{suffix}</span>;
  };

  const MoneyCell = ({ value }: { value: number | null }) => {
    if (value === null) return <span className="text-text-muted">—</span>;
    return <span className="text-sm text-foreground">${value.toFixed(0)}</span>;
  };

  const RatingCell = ({ value }: { value: number | null }) => {
    if (value === null) return <span className="text-text-muted">—</span>;
    const color = value >= 4 ? 'text-green-400' : value >= 3 ? 'text-yellow-400' : 'text-red-400';
    return <span className={cn("text-sm font-medium", color)}>{value.toFixed(1)}</span>;
  };

  const ScoreCell = ({ value }: { value: number | null }) => {
    if (value === null) return <span className="text-text-muted">—</span>;
    const color = value >= 8 ? 'text-green-400' : value >= 5 ? 'text-yellow-400' : 'text-red-400';
    return <span className={cn("text-sm font-medium", color)}>{value}/10</span>;
  };

  const hostingTypeColor = host.hostingType
    ? HOSTING_TYPE_COLORS[host.hostingType as HostingType]
    : 'bg-bg-elevated text-text-secondary';

  return (
    <tr className="group border-b border-border-subtle transition-colors hover:bg-bg-secondary/50">
      {/* Compare Checkbox */}
      <td className="w-12 px-3 py-3">
        <button
          onClick={() => onToggleCompare(host.id)}
          disabled={compareDisabled && !isSelected}
          className={cn(
            'flex h-5 w-5 items-center justify-center rounded border transition-all',
            isSelected
              ? 'border-accent bg-accent text-background'
              : 'border-border-medium hover:border-accent',
            compareDisabled && !isSelected && 'cursor-not-allowed opacity-50'
          )}
        >
          {isSelected && <Check className="h-3 w-3" />}
        </button>
      </td>

      {/* Host Name - Always visible */}
      <td className="px-3 py-3">
        <div className="flex flex-col gap-1">
          <Link
            href={`/hosting/${host.id}`}
            className="font-medium text-foreground hover:text-accent"
          >
            {host.name}
          </Link>
          {host.hostingType && (
            <span className={cn(
              'inline-block w-fit whitespace-nowrap rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
              hostingTypeColor
            )}>
              {HOSTING_TYPES[host.hostingType as HostingType]?.replace('Managed WordPress', 'Managed WP').replace(' Hosting', '') || host.hostingType}
            </span>
          )}
        </div>
      </td>

      {/* Price - Always visible */}
      <td className="px-3 py-3">
        <div className="flex flex-col">
          <span className="font-semibold text-accent">{formatPrice(host.monthlyPrice)}</span>
          {host.renewalPrice && host.renewalPrice !== host.monthlyPrice && (
            <span className="text-xs text-text-muted">
              Renews: {formatPrice(host.renewalPrice)}
            </span>
          )}
        </div>
      </td>

      {/* Essential Columns */}
      {columnSet === 'essential' && (
        <>
          <td className="px-3 py-3">{getRatingBadge(host.overallRating)}</td>
          <td className="px-3 py-3">
            {host.uptimeGuarantee ? (
              <span className="text-foreground">{host.uptimeGuarantee}%</span>
            ) : (
              <span className="text-text-muted">N/A</span>
            )}
          </td>
          <td className="px-3 py-3">
            <span className="text-foreground">{formatStorage(host.storageGb)}</span>
          </td>
          <td className="px-3 py-3">
            <div className="flex flex-wrap gap-1">
              {host.freeSsl && <Badge size="sm" variant="success">SSL</Badge>}
              {host.freeDomain && <Badge size="sm" variant="info">Domain</Badge>}
              {host.freeMigration && <Badge size="sm" variant="accent">Migration</Badge>}
              {!host.freeSsl && !host.freeDomain && !host.freeMigration && (
                <span className="text-text-muted">—</span>
              )}
            </div>
          </td>
          <td className="hidden md:table-cell px-3 py-3">
            {host.trustpilotRating ? (
              <div className="flex items-center gap-1">
                <span className="text-foreground">{host.trustpilotRating.toFixed(1)}</span>
                <span className="text-yellow-500">★</span>
              </div>
            ) : (
              <span className="text-text-muted">N/A</span>
            )}
          </td>
        </>
      )}

      {/* Technical Columns */}
      {columnSet === 'technical' && (
        <>
          <td className="px-3 py-3">
            <div className="flex flex-col">
              <span className="text-foreground">{formatStorage(host.storageGb)}</span>
              {host.storageType && (
                <span className="text-xs text-text-muted">{host.storageType}</span>
              )}
            </div>
          </td>
          <td className="px-3 py-3">
            <span className="text-foreground">{formatStorage(host.bandwidthGb)}</span>
          </td>
          <td className="px-3 py-3">
            {host.phpVersions && host.phpVersions.length > 0 ? (
              <span className="text-xs text-foreground">{host.phpVersions.slice(0, 2).join(', ')}</span>
            ) : (
              <span className="text-text-muted">—</span>
            )}
          </td>
          <td className="px-3 py-3"><BooleanCell value={host.sshAccess} /></td>
          <td className="px-3 py-3"><BooleanCell value={host.gitDeployment} /></td>
          <td className="px-3 py-3"><BooleanCell value={host.stagingEnvironment} /></td>
          <td className="hidden md:table-cell px-3 py-3"><BooleanCell value={host.nodejsSupport} /></td>
        </>
      )}

      {/* WordPress Columns */}
      {columnSet === 'wordpress' && (
        <>
          <td className="px-3 py-3"><BooleanCell value={host.wordpressOptimized} /></td>
          <td className="px-3 py-3"><BooleanCell value={host.wordpressAutoUpdates} /></td>
          <td className="px-3 py-3"><BooleanCell value={host.wordpressStaging} /></td>
          <td className="px-3 py-3"><BooleanCell value={host.woocommerceOptimized} /></td>
          <td className="px-3 py-3"><BooleanCell value={host.litespeedCache} /></td>
        </>
      )}

      {/* Security Columns */}
      {columnSet === 'security' && (
        <>
          <td className="px-3 py-3"><BooleanCell value={host.freeSsl} /></td>
          <td className="px-3 py-3"><BooleanCell value={host.ddosProtection} /></td>
          <td className="px-3 py-3"><BooleanCell value={host.malwareScanning} /></td>
          <td className="px-3 py-3">
            {host.backupFrequency ? (
              <span className="text-xs text-foreground">{host.backupFrequency}</span>
            ) : (
              <span className="text-text-muted">—</span>
            )}
          </td>
          <td className="px-3 py-3"><BooleanCell value={host.twoFactorAuth} /></td>
        </>
      )}

      {/* Support Columns */}
      {columnSet === 'support' && (
        <>
          <td className="px-3 py-3">
            {host.supportChannels && host.supportChannels.length > 0 ? (
              <span className="text-xs text-foreground">{host.supportChannels.slice(0, 3).join(', ')}</span>
            ) : (
              <span className="text-text-muted">—</span>
            )}
          </td>
          <td className="px-3 py-3"><BooleanCell value={host.liveChatAvailable} /></td>
          <td className="px-3 py-3"><BooleanCell value={host.phoneSupportAvailable} /></td>
          <td className="px-3 py-3">
            {host.liveChatHours ? (
              <span className="text-xs text-foreground">{host.liveChatHours}</span>
            ) : (
              <span className="text-text-muted">—</span>
            )}
          </td>
          <td className="hidden md:table-cell px-3 py-3">
            <NumberCell value={host.knowledgeBaseQuality} suffix="/10" />
          </td>
        </>
      )}

      {/* Pricing Columns */}
      {columnSet === 'pricing' && (
        <>
          <td className="px-3 py-3"><MoneyCell value={host.firstYearCost} /></td>
          <td className="px-3 py-3"><MoneyCell value={host.secondYearCost} /></td>
          <td className="px-3 py-3">
            {host.renewalMarkupPercent !== null ? (
              <span className={cn("text-sm", host.renewalMarkupPercent > 50 ? "text-red-400" : "text-foreground")}>
                {host.renewalMarkupPercent}%
              </span>
            ) : <span className="text-text-muted">—</span>}
          </td>
          <td className="px-3 py-3">
            {host.moneyBackDays !== null ? (
              <span className="text-sm text-foreground">{host.moneyBackDays}d</span>
            ) : <span className="text-text-muted">—</span>}
          </td>
          <td className="px-3 py-3"><MoneyCell value={host.setupFee} /></td>
          <td className="hidden md:table-cell px-3 py-3"><BooleanCell value={host.monthlyBillingAvailable} /></td>
        </>
      )}

      {/* Email Columns */}
      {columnSet === 'email' && (
        <>
          <td className="px-3 py-3"><BooleanCell value={host.emailAccountsIncluded} /></td>
          <td className="px-3 py-3">
            {host.emailAccountLimit !== null ? (
              <span className="text-sm text-foreground">
                {host.emailAccountLimit === 'Unlimited' ? '∞' : host.emailAccountLimit}
              </span>
            ) : <span className="text-text-muted">—</span>}
          </td>
          <td className="px-3 py-3">
            {host.mailboxSizeGb !== null ? (
              <span className="text-sm text-foreground">{host.mailboxSizeGb}GB</span>
            ) : <span className="text-text-muted">—</span>}
          </td>
          <td className="px-3 py-3"><BooleanCell value={host.webmailAccess} /></td>
          <td className="px-3 py-3"><BooleanCell value={host.spamFilter} /></td>
        </>
      )}

      {/* Compliance Columns */}
      {columnSet === 'compliance' && (
        <>
          <td className="px-3 py-3"><BooleanCell value={host.gdprCompliance} /></td>
          <td className="px-3 py-3"><BooleanCell value={host.pciCompliance} /></td>
          <td className="px-3 py-3"><BooleanCell value={host.hipaaCompliance} /></td>
          <td className="px-3 py-3">
            {host.dataCenterCerts && host.dataCenterCerts.length > 0 ? (
              <span className="text-xs text-foreground">{host.dataCenterCerts.slice(0, 2).join(', ')}</span>
            ) : <span className="text-text-muted">—</span>}
          </td>
        </>
      )}

      {/* Platform Columns */}
      {columnSet === 'platform' && (
        <>
          <td className="px-3 py-3"><BooleanCell value={host.drupalSupport} /></td>
          <td className="px-3 py-3"><BooleanCell value={host.joomlaSupport} /></td>
          <td className="px-3 py-3"><BooleanCell value={host.magentoSupport} /></td>
          <td className="px-3 py-3"><BooleanCell value={host.laravelSupport} /></td>
          <td className="px-3 py-3"><BooleanCell value={host.djangoSupport} /></td>
          <td className="hidden md:table-cell px-3 py-3"><BooleanCell value={host.nextjsSupport} /></td>
        </>
      )}

      {/* Performance Columns */}
      {columnSet === 'performance' && (
        <>
          <td className="px-3 py-3"><BooleanCell value={host.cdnIncluded} /></td>
          <td className="px-3 py-3">
            {host.serverLocationCount !== null ? (
              <span className="text-sm text-foreground">{host.serverLocationCount}</span>
            ) : <span className="text-text-muted">—</span>}
          </td>
          <td className="px-3 py-3"><BooleanCell value={host.http2Support} /></td>
          <td className="px-3 py-3"><BooleanCell value={host.brotliCompression} /></td>
          <td className="px-3 py-3"><BooleanCell value={host.uptimeSlaCredit} /></td>
        </>
      )}

      {/* Ratings Columns */}
      {columnSet === 'ratings' && (
        <>
          <td className="px-3 py-3"><RatingCell value={host.valueForMoney} /></td>
          <td className="px-3 py-3"><RatingCell value={host.performanceRating} /></td>
          <td className="px-3 py-3"><RatingCell value={host.supportQuality} /></td>
          <td className="px-3 py-3"><RatingCell value={host.securityRating} /></td>
          <td className="px-3 py-3"><RatingCell value={host.featuresRating} /></td>
          <td className="hidden md:table-cell px-3 py-3"><RatingCell value={host.easeOfUse} /></td>
        </>
      )}

      {/* Suitability Columns */}
      {columnSet === 'suitability' && (
        <>
          <td className="px-3 py-3"><ScoreCell value={host.suitabilityBlogger} /></td>
          <td className="px-3 py-3"><ScoreCell value={host.suitabilityEcommerce} /></td>
          <td className="px-3 py-3"><ScoreCell value={host.suitabilityAgency} /></td>
          <td className="px-3 py-3"><ScoreCell value={host.suitabilityDeveloper} /></td>
          <td className="px-3 py-3"><ScoreCell value={host.suitabilityBeginner} /></td>
          <td className="hidden md:table-cell px-3 py-3"><ScoreCell value={host.suitabilityEnterprise} /></td>
        </>
      )}

      {/* Migration Columns */}
      {columnSet === 'migration' && (
        <>
          <td className="px-3 py-3"><BooleanCell value={host.freeMigration} /></td>
          <td className="px-3 py-3">
            {host.migrationWebsitesLimit !== null ? (
              <span className="text-sm text-foreground">{host.migrationWebsitesLimit}</span>
            ) : <span className="text-text-muted">—</span>}
          </td>
          <td className="px-3 py-3">
            {host.migrationTurnaroundDays !== null ? (
              <span className="text-sm text-foreground">{host.migrationTurnaroundDays}d</span>
            ) : <span className="text-text-muted">—</span>}
          </td>
          <td className="px-3 py-3"><MoneyCell value={host.paidMigrationCost} /></td>
          <td className="px-3 py-3"><ScoreCell value={host.migrationQuality} /></td>
        </>
      )}

      {/* Control Panel Columns */}
      {columnSet === 'controlPanel' && (
        <>
          <td className="px-3 py-3"><BooleanCell value={host.cpanelIncluded} /></td>
          <td className="px-3 py-3">
            {host.controlPanelName ? (
              <span className="text-xs text-foreground">{host.controlPanelName}</span>
            ) : <span className="text-text-muted">—</span>}
          </td>
          <td className="px-3 py-3"><BooleanCell value={host.softaculous} /></td>
          <td className="px-3 py-3"><BooleanCell value={host.websiteBuilderIncluded} /></td>
          <td className="px-3 py-3">
            {host.websiteBuilderName ? (
              <span className="text-xs text-foreground">{host.websiteBuilderName}</span>
            ) : <span className="text-text-muted">—</span>}
          </td>
        </>
      )}

      {/* Policies Columns */}
      {columnSet === 'policies' && (
        <>
          <td className="px-3 py-3"><BooleanCell value={host.adultContentAllowed} /></td>
          <td className="px-3 py-3"><BooleanCell value={host.gamblingSitesAllowed} /></td>
          <td className="px-3 py-3"><BooleanCell value={host.cryptocurrencySitesAllowed} /></td>
          <td className="px-3 py-3"><BooleanCell value={host.fileHostingAllowed} /></td>
          <td className="px-3 py-3"><BooleanCell value={host.proxyVpnAllowed} /></td>
        </>
      )}

      {/* Managed WordPress Columns */}
      {columnSet === 'managedWp' && (
        <>
          <td className="px-3 py-3">
            {host.wpPricingModel ? (
              <span className="text-xs text-foreground">{host.wpPricingModel}</span>
            ) : <span className="text-text-muted">—</span>}
          </td>
          <td className="px-3 py-3">
            {host.monthlyVisitLimit !== null ? (
              <span className="text-sm text-foreground">
                {host.monthlyVisitLimit === 'Unlimited' ? '∞' : host.monthlyVisitLimit?.toLocaleString()}
              </span>
            ) : <span className="text-text-muted">—</span>}
          </td>
          <td className="px-3 py-3"><MoneyCell value={host.visitOverageCost} /></td>
          <td className="px-3 py-3"><NumberCell value={host.phpWorkerLimit} /></td>
          <td className="px-3 py-3"><BooleanCell value={host.devEnvironmentIncluded} /></td>
        </>
      )}

      {/* Regional Columns */}
      {columnSet === 'regional' && (
        <>
          <td className="px-3 py-3">
            {host.bestForCountries && host.bestForCountries.length > 0 ? (
              <span className="text-xs text-foreground">{host.bestForCountries.slice(0, 3).join(', ')}</span>
            ) : <span className="text-text-muted">—</span>}
          </td>
          <td className="px-3 py-3">
            {host.localCurrencyBilling && host.localCurrencyBilling.length > 0 ? (
              <span className="text-xs text-foreground">{host.localCurrencyBilling.slice(0, 3).join(', ')}</span>
            ) : <span className="text-text-muted">—</span>}
          </td>
          <td className="px-3 py-3">
            {host.localSupportLanguages && host.localSupportLanguages.length > 0 ? (
              <span className="text-xs text-foreground">{host.localSupportLanguages.slice(0, 2).join(', ')}</span>
            ) : <span className="text-text-muted">—</span>}
          </td>
          <td className="px-3 py-3">
            {host.dataSovereigntyCompliance && host.dataSovereigntyCompliance.length > 0 ? (
              <span className="text-xs text-foreground">{host.dataSovereigntyCompliance.slice(0, 2).join(', ')}</span>
            ) : <span className="text-text-muted">—</span>}
          </td>
        </>
      )}

      {/* Editorial Columns */}
      {columnSet === 'editorial' && (
        <>
          <td className="px-3 py-3 max-w-[200px]">
            {host.bestFor ? (
              <span className="text-xs text-foreground">{host.bestFor}</span>
            ) : <span className="text-text-muted">—</span>}
          </td>
          <td className="px-3 py-3 max-w-[200px]">
            {host.avoidIf ? (
              <span className="text-xs text-foreground">{host.avoidIf}</span>
            ) : <span className="text-text-muted">—</span>}
          </td>
          <td className="px-3 py-3 max-w-[200px]">
            {host.knownIssues ? (
              <span className="text-xs text-red-400">{host.knownIssues}</span>
            ) : <span className="text-text-muted">—</span>}
          </td>
          <td className="px-3 py-3 max-w-[200px]">
            {host.uniqueSellingPoint ? (
              <span className="text-xs text-foreground">{host.uniqueSellingPoint}</span>
            ) : <span className="text-text-muted">—</span>}
          </td>
          <td className="px-3 py-3">
            {host.primaryCompetitors && host.primaryCompetitors.length > 0 ? (
              <span className="text-xs text-foreground">{host.primaryCompetitors.slice(0, 3).join(', ')}</span>
            ) : <span className="text-text-muted">—</span>}
          </td>
        </>
      )}

      {/* Business Columns */}
      {columnSet === 'business' && (
        <>
          <td className="px-3 py-3"><BooleanCell value={host.apiAccess} /></td>
          <td className="px-3 py-3"><BooleanCell value={host.affiliateProgram} /></td>
          <td className="px-3 py-3">
            {host.affiliateCommissionAmount ? (
              <span className="text-xs text-foreground">{host.affiliateCommissionAmount}</span>
            ) : <span className="text-text-muted">—</span>}
          </td>
          <td className="px-3 py-3"><RatingCell value={host.g2Rating} /></td>
          <td className="px-3 py-3">
            {host.betterBusinessBureauRating ? (
              <span className="text-xs text-foreground">{host.betterBusinessBureauRating}</span>
            ) : <span className="text-text-muted">—</span>}
          </td>
        </>
      )}

      {/* Advanced Technical Columns */}
      {columnSet === 'advanced' && (
        <>
          <td className="px-3 py-3">
            {host.inodeLimit !== null ? (
              <span className="text-sm text-foreground">
                {host.inodeLimit === 'Unlimited' ? '∞' : host.inodeLimit?.toLocaleString()}
              </span>
            ) : <span className="text-text-muted">—</span>}
          </td>
          <td className="px-3 py-3">
            {host.databaseType ? (
              <span className="text-xs text-foreground">{host.databaseType}</span>
            ) : <span className="text-text-muted">—</span>}
          </td>
          <td className="px-3 py-3">
            {host.maxFileUploadSizeMb !== null ? (
              <span className="text-sm text-foreground">{host.maxFileUploadSizeMb}MB</span>
            ) : <span className="text-text-muted">—</span>}
          </td>
          <td className="px-3 py-3">
            {host.subdomainsLimit !== null ? (
              <span className="text-sm text-foreground">
                {host.subdomainsLimit === 'Unlimited' ? '∞' : host.subdomainsLimit}
              </span>
            ) : <span className="text-text-muted">—</span>}
          </td>
          <td className="px-3 py-3">
            {host.ftpAccountsLimit !== null ? (
              <span className="text-sm text-foreground">
                {host.ftpAccountsLimit === 'Unlimited' ? '∞' : host.ftpAccountsLimit}
              </span>
            ) : <span className="text-text-muted">—</span>}
          </td>
        </>
      )}

      {/* Actions - Always visible */}
      <td className="px-3 py-3">
        <div className="flex items-center gap-1">
          <Link
            href={`/hosting/${host.id}`}
            onClick={() => trackHostClick(host.id, host.name, 'view_details')}
          >
            <Button size="sm" variant="ghost">
              Details
            </Button>
          </Link>
          <a
            href={`/go/${host.id}`}
            target="_blank"
            rel="noopener noreferrer sponsored"
            onClick={() => trackHostClick(host.id, host.name, 'visit_site')}
          >
            <Button size="sm" className="hidden sm:flex">
              Visit
              <ExternalLink className="ml-1 h-3 w-3" />
            </Button>
          </a>
        </div>
      </td>
    </tr>
  );
}
