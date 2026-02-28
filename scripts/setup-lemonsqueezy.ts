/* ─────────────────────────────────────────
 * Lemon Squeezy 자동 세팅 스크립트
 * 비유: "가게 오픈 도우미" — API 키만 있으면
 *       상품 확인 + 웹훅 등록 + 환경변수 출력을 자동으로 처리
 *
 * 실행: pnpm tsx scripts/setup-lemonsqueezy.ts
 *
 * 사전 준비:
 *   1. Lemon Squeezy 대시보드에서 API Key 발급
 *   2. .env.local에 LEMONSQUEEZY_API_KEY, LEMONSQUEEZY_STORE_ID 설정
 *
 * 처리 흐름:
 *   1. API 키 + 스토어 유효성 검증
 *   2. 기존 Product 검색 → 없으면 생성 안내
 *   3. Variant 3개 매칭 (Deep Reading, Monthly, Yearly)
 *   4. Webhook 등록 (중복 방지)
 *   5. 환경변수 출력 → 복사해서 .env.local에 붙여넣기
 *
 * ⚠️ Lemon Squeezy API는 Product/Variant 생성을 지원하지 않음
 *    → 대시보드에서 수동 생성 필요 → 이 스크립트가 안내 제공
 * ───────────────────────────────────────── */

import { config } from 'dotenv'
import { resolve } from 'path'
import crypto from 'crypto'

// ─── .env.local 로드 ───
config({ path: resolve(process.cwd(), '.env.local') })

// ─── 상수 ───
const API_BASE = 'https://api.lemonsqueezy.com/v1'
const WEBHOOK_URL = 'https://fate-weaver.vercel.app/api/payments/webhook'
const WEBHOOK_EVENTS = [
  'subscription_created',
  'subscription_updated',
  'subscription_cancelled',
  'order_created',
] as const

/** 우리가 찾거나 만들어야 할 상품 이름 */
const PRODUCT_NAME = 'FateWeaver Premium'

/** 우리가 찾거나 만들어야 할 Variant 정의 */
const EXPECTED_VARIANTS = [
  { name: 'Deep Reading', price: 399, interval: null, intervalCount: null },
  { name: 'Premium Monthly', price: 699, interval: 'month', intervalCount: 1 },
  { name: 'Premium Yearly', price: 4999, interval: 'year', intervalCount: 1 },
] as const

// ─── 콘솔 색상 헬퍼 ───
const c = {
  green: (s: string) => `\x1b[32m${s}\x1b[0m`,
  red: (s: string) => `\x1b[31m${s}\x1b[0m`,
  yellow: (s: string) => `\x1b[33m${s}\x1b[0m`,
  cyan: (s: string) => `\x1b[36m${s}\x1b[0m`,
  bold: (s: string) => `\x1b[1m${s}\x1b[0m`,
  dim: (s: string) => `\x1b[2m${s}\x1b[0m`,
}

// ─── 타입 ───
interface LsResponse<T> {
  data: T
  meta?: { page?: { total: number } }
  errors?: Array<{ detail: string }>
}

interface LsResource {
  id: string
  type: string
  attributes: Record<string, unknown>
}

// ─── API 헬퍼 ───

/** Lemon Squeezy API 호출 래퍼 — 에러 처리 + 재시도 안내 포함 */
async function lsApi<T>(
  path: string,
  options: RequestInit = {}
): Promise<LsResponse<T>> {
  const apiKey = process.env.LEMONSQUEEZY_API_KEY

  const url = path.startsWith('http') ? path : `${API_BASE}${path}`

  const res = await fetch(url, {
    ...options,
    headers: {
      Accept: 'application/vnd.api+json',
      'Content-Type': 'application/vnd.api+json',
      Authorization: `Bearer ${apiKey}`,
      ...((options.headers as Record<string, string>) ?? {}),
    },
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(
      `API 요청 실패 (${res.status} ${res.statusText})\n` +
        `  URL: ${url}\n` +
        `  응답: ${body}\n\n` +
        `  💡 네트워크 에러라면 잠시 후 다시 실행해 보세요.`
    )
  }

  return res.json() as Promise<LsResponse<T>>
}

/** 페이지네이션을 처리하여 모든 결과 수집 */
async function lsListAll<T extends LsResource>(path: string): Promise<T[]> {
  const results: T[] = []
  let nextUrl: string | null = `${API_BASE}${path}`

  while (nextUrl) {
    const res = await lsApi<T[]>(nextUrl)
    if (Array.isArray(res.data)) {
      results.push(...res.data)
    }
    // 다음 페이지 URL 확인
    const links = (res as unknown as { links?: { next?: string } }).links
    nextUrl = links?.next ?? null
  }

  return results
}

// ─── 메인 로직 ───

async function main() {
  console.log('\n' + c.bold('🍋 Lemon Squeezy 자동 세팅 스크립트'))
  console.log(c.dim('─'.repeat(50)) + '\n')

  // ────────────────────────────────────────
  // Step 0: 환경변수 확인
  // ────────────────────────────────────────
  const apiKey = process.env.LEMONSQUEEZY_API_KEY
  const storeId = process.env.LEMONSQUEEZY_STORE_ID

  if (!apiKey) {
    console.error(c.red('❌ LEMONSQUEEZY_API_KEY가 설정되지 않았습니다.\n'))
    console.log('  1. https://app.lemonsqueezy.com/settings/api 에서 API Key를 발급하세요.')
    console.log('  2. .env.local 파일에 추가하세요:')
    console.log(c.cyan('     LEMONSQUEEZY_API_KEY=your-api-key\n'))
    process.exit(1)
  }

  if (!storeId) {
    console.error(c.red('❌ LEMONSQUEEZY_STORE_ID가 설정되지 않았습니다.\n'))
    console.log('  1. https://app.lemonsqueezy.com/settings/stores 에서 Store ID를 확인하세요.')
    console.log('     (URL에서 숫자 부분이 Store ID입니다)')
    console.log('  2. .env.local 파일에 추가하세요:')
    console.log(c.cyan('     LEMONSQUEEZY_STORE_ID=your-store-id\n'))
    process.exit(1)
  }

  // ────────────────────────────────────────
  // Step 1: API 키 + 스토어 유효성 검증
  // ────────────────────────────────────────
  console.log(c.bold('Step 1: API 키 + 스토어 검증'))

  try {
    const storeRes = await lsApi<LsResource>(`/stores/${storeId}`)
    const storeName = storeRes.data.attributes.name as string
    console.log(c.green(`  ✓ 스토어 확인: "${storeName}" (ID: ${storeId})`))
  } catch (err) {
    console.error(c.red(`  ✗ 스토어 접근 실패`))
    console.error(`    API Key 또는 Store ID를 확인해 주세요.`)
    console.error(`    ${err instanceof Error ? err.message : String(err)}`)
    process.exit(1)
  }

  // ────────────────────────────────────────
  // Step 2: Product 확인
  // ────────────────────────────────────────
  console.log('\n' + c.bold('Step 2: 상품(Product) 확인'))

  const allProducts = await lsListAll<LsResource>(
    `/products?filter[store_id]=${storeId}`
  )

  // "FateWeaver" 포함 상품 찾기 (대소문자 무시)
  let product = allProducts.find((p) => {
    const name = (p.attributes.name as string).toLowerCase()
    return name.includes('fateweaver') || name.includes('fate weaver')
  })

  if (!product) {
    // 이름 정확 매칭 시도
    product = allProducts.find(
      (p) => (p.attributes.name as string) === PRODUCT_NAME
    )
  }

  if (product) {
    console.log(
      c.green(
        `  ✓ 기존 상품 발견: "${product.attributes.name}" (ID: ${product.id})`
      )
    )
  } else {
    // ── 상품이 없으면 생성 안내 ──
    console.log(c.yellow('  ⚠ FateWeaver 관련 상품이 없습니다.'))
    console.log('')
    console.log(c.bold('  📋 Lemon Squeezy 대시보드에서 상품을 생성해 주세요:'))
    console.log('')
    console.log(`  ${c.cyan('https://app.lemonsqueezy.com/products/new')}`)
    console.log('')
    console.log(`  ${c.bold('상품 이름:')} ${PRODUCT_NAME}`)
    console.log(`  ${c.bold('설명:')} AI-powered fortune reading — Tarot + Saju combined`)
    console.log('')
    console.log(c.bold('  Variant 3개를 다음과 같이 설정하세요:'))
    console.log('')
    console.log(`  ${c.bold('1. Deep Reading')}`)
    console.log(`     - 가격: $3.99 (원타임 결제)`)
    console.log(`     - 결제 유형: One-time payment`)
    console.log('')
    console.log(`  ${c.bold('2. Premium Monthly')}`)
    console.log(`     - 가격: $6.99/월`)
    console.log(`     - 결제 유형: Subscription (Monthly)`)
    console.log('')
    console.log(`  ${c.bold('3. Premium Yearly')}`)
    console.log(`     - 가격: $49.99/년`)
    console.log(`     - 결제 유형: Subscription (Yearly)`)
    console.log('')
    console.log(c.dim('  상품 생성 후 이 스크립트를 다시 실행하면'))
    console.log(c.dim('  자동으로 Variant ID를 매칭합니다.'))
    console.log('')

    // 기존 상품이 있으면 참고로 보여주기
    if (allProducts.length > 0) {
      console.log(c.dim('  현재 스토어의 기존 상품:'))
      for (const p of allProducts) {
        console.log(c.dim(`    - "${p.attributes.name}" (ID: ${p.id})`))
      }
      console.log('')
    }

    // 웹훅만이라도 등록할지 묻기 (논블로킹으로 계속 진행)
    console.log(c.yellow('  → 웹훅 등록은 계속 진행합니다...\n'))
    await setupWebhook(storeId)
    printIncompleteEnvVars()
    process.exit(0)
  }

  // ────────────────────────────────────────
  // Step 3: Variant 매칭
  // ────────────────────────────────────────
  console.log('\n' + c.bold('Step 3: Variant 매칭'))

  const allVariants = await lsListAll<LsResource>(
    `/variants?filter[product_id]=${product.id}`
  )

  if (allVariants.length === 0) {
    console.log(c.yellow('  ⚠ 이 상품에 Variant가 없습니다.'))
    console.log('  Lemon Squeezy 대시보드에서 Variant를 추가해 주세요.')
    await setupWebhook(storeId)
    printIncompleteEnvVars()
    process.exit(0)
  }

  console.log(c.dim(`  총 ${allVariants.length}개 Variant 발견\n`))

  // 매칭 로직: 이름 + 가격으로 최선의 매칭
  const matched = {
    onetime: null as string | null,
    monthly: null as string | null,
    yearly: null as string | null,
  }

  for (const v of allVariants) {
    const name = (v.attributes.name as string).toLowerCase()
    const price = v.attributes.price as number // 센트 단위
    const isSubscription = v.attributes.is_subscription as boolean
    const interval = v.attributes.interval as string | null

    // 디버그 출력
    console.log(
      c.dim(
        `  [${v.id}] "${v.attributes.name}" — $${(price / 100).toFixed(2)} ` +
          `(${isSubscription ? `구독/${interval}` : '원타임'})`
      )
    )

    // Deep Reading: 원타임 + 이름에 'deep' 또는 가격 $3.99
    if (
      !matched.onetime &&
      (!isSubscription || interval === null) &&
      (name.includes('deep') || name.includes('one') || price === 399)
    ) {
      matched.onetime = v.id
    }

    // Monthly: 구독 + month + 이름에 'month' 또는 가격 $6.99
    if (
      !matched.monthly &&
      isSubscription &&
      interval === 'month' &&
      (name.includes('month') || price === 699)
    ) {
      matched.monthly = v.id
    }

    // Yearly: 구독 + year + 이름에 'year' 또는 가격 $49.99
    if (
      !matched.yearly &&
      isSubscription &&
      interval === 'year' &&
      (name.includes('year') || name.includes('annual') || price === 4999)
    ) {
      matched.yearly = v.id
    }
  }

  // 이름 매칭 실패 시 폴백: 순서대로 할당
  if (!matched.onetime || !matched.monthly || !matched.yearly) {
    console.log(c.yellow('\n  ⚠ 일부 Variant를 자동 매칭하지 못했습니다.'))

    // 매칭되지 않은 것 중 할당 안 된 variant 시도
    const unmatched = allVariants.filter(
      (v) =>
        v.id !== matched.onetime &&
        v.id !== matched.monthly &&
        v.id !== matched.yearly
    )

    for (const v of unmatched) {
      const isSubscription = v.attributes.is_subscription as boolean
      const interval = v.attributes.interval as string | null

      if (!matched.onetime && !isSubscription) {
        matched.onetime = v.id
      } else if (!matched.monthly && isSubscription && interval === 'month') {
        matched.monthly = v.id
      } else if (!matched.yearly && isSubscription && interval === 'year') {
        matched.yearly = v.id
      }
    }
  }

  console.log('')
  console.log(
    matched.onetime
      ? c.green(`  ✓ Deep Reading (원타임):   Variant ID = ${matched.onetime}`)
      : c.red('  ✗ Deep Reading (원타임):   매칭 실패 — 대시보드에서 확인 필요')
  )
  console.log(
    matched.monthly
      ? c.green(`  ✓ Premium Monthly (구독):  Variant ID = ${matched.monthly}`)
      : c.red('  ✗ Premium Monthly (구독):  매칭 실패 — 대시보드에서 확인 필요')
  )
  console.log(
    matched.yearly
      ? c.green(`  ✓ Premium Yearly (구독):   Variant ID = ${matched.yearly}`)
      : c.red('  ✗ Premium Yearly (구독):   매칭 실패 — 대시보드에서 확인 필요')
  )

  // ────────────────────────────────────────
  // Step 4: Webhook 등록
  // ────────────────────────────────────────
  const webhookSecret = await setupWebhook(storeId)

  // ────────────────────────────────────────
  // Step 5: 환경변수 출력
  // ────────────────────────────────────────
  console.log('\n' + c.bold('═'.repeat(50)))
  console.log(c.bold('📋 아래 환경변수를 .env.local에 추가하세요:'))
  console.log(c.bold('═'.repeat(50)) + '\n')

  console.log(c.cyan('# ─── Lemon Squeezy (자동 생성됨) ───'))
  console.log(c.cyan(`PAYMENT_PROVIDER=lemonsqueezy`))

  if (matched.monthly) {
    console.log(c.cyan(`LEMONSQUEEZY_MONTHLY_VARIANT_ID=${matched.monthly}`))
  } else {
    console.log(c.yellow(`# LEMONSQUEEZY_MONTHLY_VARIANT_ID=  # 대시보드에서 확인 후 입력`))
  }

  if (matched.yearly) {
    console.log(c.cyan(`LEMONSQUEEZY_YEARLY_VARIANT_ID=${matched.yearly}`))
  } else {
    console.log(c.yellow(`# LEMONSQUEEZY_YEARLY_VARIANT_ID=  # 대시보드에서 확인 후 입력`))
  }

  if (matched.onetime) {
    console.log(c.cyan(`LEMONSQUEEZY_ONETIME_VARIANT_ID=${matched.onetime}`))
  } else {
    console.log(c.yellow(`# LEMONSQUEEZY_ONETIME_VARIANT_ID=  # 대시보드에서 확인 후 입력`))
  }

  if (webhookSecret) {
    console.log(c.cyan(`LEMONSQUEEZY_WEBHOOK_SECRET=${webhookSecret}`))
  } else {
    console.log(c.yellow(`# LEMONSQUEEZY_WEBHOOK_SECRET=  # 기존 웹훅의 시크릿 사용`))
  }

  console.log('')

  // 누락 항목 경고
  const missing = [
    !matched.onetime && 'LEMONSQUEEZY_ONETIME_VARIANT_ID',
    !matched.monthly && 'LEMONSQUEEZY_MONTHLY_VARIANT_ID',
    !matched.yearly && 'LEMONSQUEEZY_YEARLY_VARIANT_ID',
    !webhookSecret && 'LEMONSQUEEZY_WEBHOOK_SECRET',
  ].filter(Boolean)

  if (missing.length > 0) {
    console.log(c.yellow('⚠ 다음 항목은 수동 설정이 필요합니다:'))
    for (const m of missing) {
      console.log(c.yellow(`  - ${m}`))
    }
    console.log('')
  }

  // Vercel 배포 안내
  console.log(c.dim('💡 Vercel에도 동일한 환경변수를 설정하세요:'))
  console.log(c.dim('   vercel env add PAYMENT_PROVIDER'))
  console.log(c.dim('   vercel env add LEMONSQUEEZY_MONTHLY_VARIANT_ID'))
  console.log(c.dim('   ... (각 변수마다 반복)\n'))

  console.log(c.green(c.bold('✅ 세팅 완료!\n')))
}

// ─── Webhook 등록 ───

async function setupWebhook(storeId: string): Promise<string | null> {
  console.log('\n' + c.bold('Step 4: Webhook 등록'))

  // 기존 웹훅 확인
  const existingWebhooks = await lsListAll<LsResource>(
    `/webhooks?filter[store_id]=${storeId}`
  )

  const existingHook = existingWebhooks.find(
    (w) => (w.attributes.url as string) === WEBHOOK_URL
  )

  if (existingHook) {
    console.log(c.green(`  ✓ 이미 등록됨: ${WEBHOOK_URL}`))
    console.log(c.dim(`    Webhook ID: ${existingHook.id}`))

    // 이벤트 확인
    const currentEvents = (existingHook.attributes.events as string[]) ?? []
    const missingEvents = WEBHOOK_EVENTS.filter(
      (e) => !currentEvents.includes(e)
    )

    if (missingEvents.length > 0) {
      console.log(c.yellow(`  ⚠ 누락된 이벤트: ${missingEvents.join(', ')}`))
      console.log(c.dim('    → 대시보드에서 이벤트를 추가하거나, 삭제 후 재실행하세요.'))
    }

    // 기존 웹훅의 시크릿은 API로 조회 불가 → null 반환
    console.log(c.dim('  ℹ 기존 웹훅의 시크릿은 API로 조회할 수 없습니다.'))
    console.log(c.dim('    대시보드에서 확인하거나, 이 웹훅을 삭제 후 재실행하세요.'))
    return null
  }

  // 새 웹훅 생성
  const secret = crypto.randomBytes(32).toString('hex')

  try {
    const { data: webhook } = await lsApi<LsResource>('/webhooks', {
      method: 'POST',
      body: JSON.stringify({
        data: {
          type: 'webhooks',
          attributes: {
            url: WEBHOOK_URL,
            events: [...WEBHOOK_EVENTS],
            secret,
          },
          relationships: {
            store: {
              data: {
                type: 'stores',
                id: storeId,
              },
            },
          },
        },
      }),
    })

    console.log(c.green(`  ✓ 웹훅 등록 완료`))
    console.log(c.dim(`    URL: ${WEBHOOK_URL}`))
    console.log(c.dim(`    ID: ${webhook.id}`))
    console.log(c.dim(`    이벤트: ${WEBHOOK_EVENTS.join(', ')}`))
    console.log(c.dim(`    시크릿: ${secret.substring(0, 8)}...`))

    return secret
  } catch (err) {
    console.error(c.red('  ✗ 웹훅 등록 실패'))
    console.error(`    ${err instanceof Error ? err.message : String(err)}`)
    console.log(c.yellow('  → 대시보드에서 수동으로 웹훅을 등록해 주세요:'))
    console.log(c.cyan(`    https://app.lemonsqueezy.com/settings/webhooks`))
    console.log(`    URL: ${WEBHOOK_URL}`)
    console.log(`    이벤트: ${WEBHOOK_EVENTS.join(', ')}`)
    return null
  }
}

/** 상품이 없을 때 불완전한 env 변수 출력 */
function printIncompleteEnvVars() {
  console.log('\n' + c.bold('═'.repeat(50)))
  console.log(c.bold('📋 현재까지 확인된 환경변수:'))
  console.log(c.bold('═'.repeat(50)) + '\n')
  console.log(c.cyan('PAYMENT_PROVIDER=lemonsqueezy'))
  console.log(c.yellow('# LEMONSQUEEZY_MONTHLY_VARIANT_ID=  # 상품 생성 후 재실행'))
  console.log(c.yellow('# LEMONSQUEEZY_YEARLY_VARIANT_ID=   # 상품 생성 후 재실행'))
  console.log(c.yellow('# LEMONSQUEEZY_ONETIME_VARIANT_ID=  # 상품 생성 후 재실행'))
  console.log('')
  console.log(c.dim('상품을 대시보드에서 생성한 후 이 스크립트를 다시 실행하세요.'))
  console.log(c.dim('Variant ID가 자동으로 매칭됩니다.\n'))
}

// ─── 실행 ───
main().catch((err) => {
  console.error('\n' + c.red('❌ 예상치 못한 에러가 발생했습니다:'))
  console.error(`   ${err instanceof Error ? err.message : String(err)}`)
  console.error('')
  console.error(c.dim('💡 문제 해결 체크리스트:'))
  console.error(c.dim('   1. 인터넷 연결 상태를 확인하세요'))
  console.error(c.dim('   2. .env.local의 API 키가 유효한지 확인하세요'))
  console.error(c.dim('   3. Lemon Squeezy 서비스 상태를 확인하세요: https://status.lemonsqueezy.com'))
  console.error(c.dim('   4. 잠시 후 다시 실행해 보세요'))
  process.exit(1)
})
