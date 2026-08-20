# Currency review — was every committed decision reality-checked?

## Verified against live sources on 2026-08-19

Live npm registry: react 19.2.8 · vite 8.2.1 · typescript 7.0.2 (latest) / 6.0.3 (last stable 6.x) ·
nx 23.1.1 · @tanstack/react-query 5.101.4 · @tanstack/react-router 1.170.30 · @dnd-kit/core 6.3.1 ·
eslint 10.8.1 · typescript-eslint 8.67.0 · @phosphor-icons/react 2.1.10 · @fontsource/inter 5.3.0.
Live NuGet: Amazon.Lambda.AspNetCoreServer.Hosting 2.2.1 · AWSSDK.DynamoDBv2 4.0.103.3.
Web: aws-cdk-lib 2.265.0 line, Node 22.x baseline.

Vendor/press verified: .NET 10 is LTS to Nov 2028 and a Lambda managed runtime since 2026-01-08;
.NET 11 is STS, in preview, ships Nov 2026. TypeScript 7.0 GA 2026-07-08. Cognito tiers and the
10,000-MAU indefinite free tier on Lite/Essentials, none on Plus. SnapStart free only for Java
managed runtimes; .NET incurs cache + restore charges. DynamoDB on-demand billed from the first
request, 25 GB storage always free, 25 WCU/RCU always-free applies to provisioned only. API Gateway
1M/mo free for 12 months only; HTTP API $1.00/M vs REST $3.50/M thereafter. CloudFront 1 TB + 10M
requests always free, no expiry. ACM public certs free; CloudFront alternate domain names free; ACM
for CloudFront must be us-east-1. Route 53 hosted zone $0.50/mo, not required to front CloudFront.
@nx-dotnet/core unmaintained; official @nx/dotnet is Nx 22+ and experimental.

## Findings

**Caught and corrected — TypeScript 7.** The newest release would have been the default pin. It is
GA, but typescript-eslint closed TS7 support as *not planned* and ESLint core is blocked behind it.
AD-2 and AD-15 are both enforced by ESLint rules, so pinning TS7 would have disabled the spine's own
enforcement. Pinned 6.0.3 with an explicit revisit condition.

**Caught and corrected — .NET 11.** Preview, STS, ships Nov 2026. Pinned .NET 10 LTS.

**Caught and corrected — SnapStart.** The common assumption that SnapStart is free is true only for
Java. Verified and excluded from the cost envelope.

**Caught and corrected — the Route 53 premise.** The user believed a custom domain costs money on
AWS and is free on Vercel. Verified false: ACM and CloudFront CNAMEs are free, Route 53 is optional.
The decision was re-put on corrected facts and reversed.

**Gap — no version pinned for the OpenAPI-to-TypeScript generator (AD-10).** The mechanism is
specified but the tool is not chosen. Low risk; a build-time dev dependency, swappable.

**Gap — CDK construct-level currency not checked.** aws-cdk-lib 2.265.0 is verified, but whether any
specific L2 construct used for HTTP API + JWT authorizer is still the recommended one was not.
Acceptable: CDK's v2 surface is stable and this is discovered on first deploy, not designed around.

## Verdict
No decision rests on unverified training-data recall. Two would-be defaults (TypeScript 7, .NET 11)
were actively caught by checking rather than assumed, and one user-held premise was corrected.
