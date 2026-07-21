import { useEffect, useMemo, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import CampaignInfoForm from '@/components/campaign/CampaignInfoForm'
import CampaignSummary from '@/components/campaign/CampaignSummary'
import MediaListPanel from '@/components/campaign/MediaListPanel'
import MediaListSideTab from '@/components/campaign/MediaListSideTab'
import MediaMap from '@/components/campaign/MediaMap'
import VideoUploadCard from '@/components/campaign/VideoUploadCard'
import type { UploadStatus } from '@/components/campaign/VideoUploadCard'
import { Icon, Modal, ProgressBar, useToast } from '@/components/ui'
import { useAuth } from '@/lib/auth'
import { ROUTES } from '@/lib/routes'
import {
  ALL_SIGUNGU,
  campaignInfoSchema,
  CampaignApiError,
  createCampaign,
  toApiDate,
  uploadCampaignVideo,
  useMediaRegions,
  useMediaUnits,
} from '@/lib/campaign'
import type {
  CampaignInfoValues,
  CampaignMedia,
  MediaUnitsQuery,
} from '@/lib/campaign'

const REGISTER_STEPS = ['기본 정보', '매체 선택', '최종 확인']

type RegisterStep = 1 | 2 | 3

const STEP_SUBTITLE: Record<RegisterStep, string> = {
  1: '송출할 광고 영상과 기본 정보를 입력해주세요.',
  2: '광고를 송출할 매체를 선택하세요.',
  3: '마지막으로 입력한 정보가 올바른지 확인하세요.',
}

// 저장된 초안이 없을 때 쓰는 빈 폼 초기값
const EMPTY_INFO: CampaignInfoValues = {
  name: '',
  brand: '',
  period: {},
  dailyPlayCount: '',
  memo: '',
}

/**
 * 업로드한 영상에서 정지 프레임 썸네일(JPEG dataURL)을 추출한다.
 * 실제 업로드 완료와 무관하게 로컬 파일에서 즉시 생성 — 미리보기 표시·다음 단계 진행 판단에 사용.
 * maxWidth로 축소해 dataURL 크기를 억제한다.
 */
function extractVideoThumbnail(file: File, maxWidth = 640): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const video = document.createElement('video')
    video.muted = true
    video.preload = 'metadata'

    const timer = setTimeout(
      () => fail('썸네일 생성 시간이 초과되었습니다.'),
      10000,
    )
    function cleanup() {
      clearTimeout(timer)
      URL.revokeObjectURL(url)
    }
    function fail(message: string) {
      cleanup()
      reject(new Error(message))
    }
    function capture() {
      const w = video.videoWidth
      const h = video.videoHeight
      if (!w || !h) return fail('영상 크기를 확인할 수 없습니다.')
      const scale = Math.min(1, maxWidth / w)
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(w * scale)
      canvas.height = Math.round(h * scale)
      const ctx = canvas.getContext('2d')
      if (!ctx) return fail('썸네일을 생성할 수 없습니다.')
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      cleanup()
      resolve(canvas.toDataURL('image/jpeg', 0.7))
    }

    // 0초 프레임은 검은 화면일 수 있어 살짝 뒤 프레임을 캡처
    video.onloadeddata = () => {
      const seekTo = Math.min(0.1, video.duration || 0)
      if (seekTo > 0) video.currentTime = seekTo
      else capture()
    }
    video.onseeked = capture
    video.onerror = () => fail('영상을 읽을 수 없습니다.')
    video.src = url
  })
}

interface UploadState {
  status: UploadStatus
  file: File | null
  /** 로컬 영상에서 추출한 썸네일(JPEG dataURL) — 업로드 완료와 무관하게 미리보기·다음 진행 판단에 사용 */
  thumbnailUrl: string | null
  /** 업로드 완료 시 발급된 creativeToken — 캠페인 등록 요청에 사용 */
  creativeToken: string | null
}

const INITIAL_UPLOAD: UploadState = {
  status: 'idle',
  file: null,
  thumbnailUrl: null,
  creativeToken: null,
}

// ── 초안 영속화 ─────────────────────────────────────────
// 스텝2에서 새로고침해도 입력이 날아가지 않도록, 폼 값과 '완료된' 업로드를 세션에 저장/복원한다.
// File은 직렬화가 안 되므로 저장하지 않고, 이미 발급된 creativeToken·썸네일만 저장해 이어서 진행한다.
// sessionStorage: 새로고침엔 유지·탭을 닫으면 정리. 등록 성공 시 명시적으로 비운다.
const DRAFT_KEY = 'campaign-register-draft'

interface StoredDraft {
  info: {
    name: string
    brand: string
    period: { start?: string; end?: string }
    dailyPlayCount: string
    memo: string
  }
  upload: {
    status: UploadStatus
    thumbnailUrl: string | null
    creativeToken: string | null
  }
}

function readDraft(): { info: CampaignInfoValues; upload: UploadState } | null {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY)
    if (!raw) return null
    const draft = JSON.parse(raw) as StoredDraft
    const info: CampaignInfoValues = {
      name: draft.info.name ?? '',
      brand: draft.info.brand ?? '',
      period: {
        start: draft.info.period?.start
          ? new Date(draft.info.period.start)
          : undefined,
        end: draft.info.period?.end
          ? new Date(draft.info.period.end)
          : undefined,
      },
      dailyPlayCount: draft.info.dailyPlayCount ?? '',
      memo: draft.info.memo ?? '',
    }
    // 완료된 업로드만 복원해 '다음'을 이어서 활성화. 미완료/실패는 idle로 되돌려 재업로드하게 한다.
    const saved = draft.upload
    const upload: UploadState =
      saved?.status === 'success' && saved.creativeToken
        ? {
            status: 'success',
            file: null,
            thumbnailUrl: saved.thumbnailUrl,
            creativeToken: saved.creativeToken,
          }
        : { ...INITIAL_UPLOAD }
    return { info, upload }
  } catch {
    return null
  }
}

function saveDraft(info: CampaignInfoValues, upload: UploadState): void {
  try {
    const draft: StoredDraft = {
      info: {
        name: info.name,
        brand: info.brand,
        period: {
          start: info.period?.start?.toISOString(),
          end: info.period?.end?.toISOString(),
        },
        dailyPlayCount: info.dailyPlayCount,
        memo: info.memo,
      },
      // 완료된 업로드만 저장(재개용). 진행/실패 상태는 저장하지 않는다.
      upload:
        upload.status === 'success' && upload.creativeToken
          ? {
              status: 'success',
              thumbnailUrl: upload.thumbnailUrl,
              creativeToken: upload.creativeToken,
            }
          : { status: 'idle', thumbnailUrl: null, creativeToken: null },
    }
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
  } catch {
    // 저장 실패(용량 초과 등)는 무시 — 영속화는 편의 기능
  }
}

function clearDraft(): void {
  try {
    sessionStorage.removeItem(DRAFT_KEY)
  } catch {
    /* noop */
  }
}

/**
 * 캠페인 등록 — 3단계 위저드 (기본 정보 → 매체 선택 → 최종 확인).
 * 폼·업로드·매체 선택 상태는 단계 왕복에도 보존되도록 전부 이 페이지가 소유한다
 * (step 컴포넌트는 전환 시 언마운트되므로 하위에 상태를 두지 않는다)
 */
export default function CampaignRegisterPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [step, setStep] = useState<RegisterStep>(1)
  // 1단계에서 입력 내용이 있는 채로 나가려 할 때 확인 모달
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false)

  // 새로고침 대비: 세션에 저장된 초안(입력값 + 완료된 업로드)을 초기값으로 1회 복원
  const [initialDraft] = useState(readDraft)

  // Step1 기본 정보 폼 — 단계를 오가도 값이 유지되도록 페이지가 인스턴스를 소유
  const form = useForm<CampaignInfoValues>({
    resolver: zodResolver(campaignInfoSchema),
    mode: 'onTouched',
    defaultValues: initialDraft?.info ?? EMPTY_INFO,
  })
  // isDirty는 렌더 중 읽어야 RHF proxy가 추적·갱신한다(콜백 안에서만 읽으면 초기값 유지)
  const isFormDirty = form.formState.isDirty

  // 영상 업로드 — 단계 이동 후에도 진행·토스트가 이어지도록 페이지가 상태를 소유
  const { toast } = useToast()
  const [upload, setUpload] = useState<UploadState>(
    initialDraft?.upload ?? INITIAL_UPLOAD,
  )
  // form.watch 콜백이 항상 최신 업로드를 참조하도록 ref 경유
  const uploadRef = useRef(upload)
  // abort가 불가하므로 시퀀스 토큰으로 취소·재업로드 이후 도착한 응답을 무시
  const uploadSeqRef = useRef(0)

  // 폼/업로드 변경 시 세션에 초안 저장(새로고침 복원용)
  useEffect(() => {
    const sub = form.watch(() => saveDraft(form.getValues(), uploadRef.current))
    return () => sub.unsubscribe()
  }, [form])
  useEffect(() => {
    uploadRef.current = upload
    saveDraft(form.getValues(), upload)
  }, [upload, form])
  // 등록 라우트를 떠날 때(로그아웃·다른 라우터 이동·'그만두기' 모달로 나가기) 초안을 비운다.
  // 새로고침은 언마운트가 아니라 페이지 리로드라 이 cleanup이 돌지 않아 초안이 유지된다.
  useEffect(() => () => clearDraft(), [])

  const handleFileSelect = (file: File) => {
    // accept="video/*"는 드래그&드롭을 막지 못하므로 형식을 재검증
    if (!file.type.startsWith('video/')) {
      toast('영상 파일만 업로드할 수 있습니다.', { status: 'error' })
      return
    }
    const seq = ++uploadSeqRef.current
    setUpload({
      status: 'uploading',
      file,
      thumbnailUrl: null,
      creativeToken: null,
    })

    // 썸네일 추출 — 업로드 완료와 무관하게 즉시 미리보기 생성 (다음 단계 진행 판단 기준)
    extractVideoThumbnail(file)
      .then((thumbnailUrl) => {
        if (seq !== uploadSeqRef.current) return // 취소·재선택으로 무효화됨
        setUpload((prev) => ({ ...prev, thumbnailUrl }))
      })
      .catch(() => {
        if (seq !== uploadSeqRef.current) return
        toast('영상 미리보기를 생성하지 못했습니다.', { status: 'error' })
      })

    // 영상 업로드 — presigned, 백그라운드로 진행 (완료 시 creativeToken 확보)
    uploadCampaignVideo(file)
      .then(({ creativeToken }) => {
        if (seq !== uploadSeqRef.current) return
        setUpload((prev) => ({ ...prev, status: 'success', creativeToken }))
        toast('영상 업로드가 완료되었습니다.', { status: 'success' })
      })
      .catch(() => {
        if (seq !== uploadSeqRef.current) return
        setUpload((prev) => ({ ...prev, status: 'error', creativeToken: null }))
        toast('영상 업로드에 실패했습니다. 다시 시도하세요.', {
          status: 'error',
        })
      })
  }

  const handleUploadCancel = () => {
    uploadSeqRef.current += 1
    setUpload(INITIAL_UPLOAD)
  }

  // 매체 선택 — 지역/검색 필터를 페이지가 소유해 서버사이드 조회를 구동한다.
  // step 2 진입 시에만 지역/목록을 조회 (기본 정보 입력 중 불필요한 호출 방지)
  const onStep2 = step >= 2
  const { data: regions = [] } = useMediaRegions(onStep2)
  const [sido, setSido] = useState('서울특별시')
  // 진입 기본: 서울특별시 중구 (사용자 위치 기반의 대체값 — 결과를 좁혀 초기 로딩을 가볍게)
  const [sigungu, setSigungu] = useState('중구')
  const [keyword, setKeyword] = useState('')

  // 검색어 디바운스 — 키 입력마다 재조회하지 않도록
  const [debouncedKeyword, setDebouncedKeyword] = useState('')
  useEffect(() => {
    const t = setTimeout(() => setDebouncedKeyword(keyword.trim()), 300)
    return () => clearTimeout(t)
  }, [keyword])

  // 매체 available은 캠페인 송출기간 기준으로 계산되므로 기간을 함께 조회 파라미터로 보낸다.
  // watch로 구독해 기간이 바뀌면 목록·가용성이 즉시 갱신되도록 한다
  const period = form.watch('period')
  // 검색어가 있으면 지역보다 우선(검색 결과 우선), 없으면 지역(시/도·시/군/구) 필터
  const mediaQuery: MediaUnitsQuery = {
    ...(debouncedKeyword
      ? { keyword: debouncedKeyword }
      : { sido, sigungu: sigungu === ALL_SIGUNGU ? undefined : sigungu }),
    executionStartDate: period.start ? toApiDate(period.start) : undefined,
    executionEndDate: period.end ? toApiDate(period.end) : undefined,
  }

  const {
    data: mediaData,
    isPending: mediaLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useMediaUnits(onStep2, mediaQuery)
  // 무한 스크롤 페이지들을 하나의 목록으로 펼친다(지도 마커·리스트 공통).
  // useMemo로 참조를 안정화 — 매 렌더 새 배열이면 MediaMap 이펙트(핀 동기화·setBounds)가 과하게 재실행됨.
  const mediaList = useMemo(
    () => mediaData?.pages.flatMap((page) => page.items) ?? [],
    [mediaData],
  )

  // 매체 목록 패널 접기/펴기 (사이드 탭)
  const [listCollapsed, setListCollapsed] = useState(false)

  // 선택 매체는 객체로 보관 — 지역/검색 필터로 목록이 바뀌어도 선택이 유지되도록
  const [selectedMedia, setSelectedMedia] = useState<CampaignMedia | null>(null)
  const selectedMediaId = selectedMedia?.id ?? null

  // available=false 매체는 선택 불가 — 안내 토스트만 띄우고 선택하지 않는다
  const handleSelectMedia = (media: CampaignMedia) => {
    if (!media.available) {
      toast('선택한 송출기간에 등록할 수 없는 매체입니다.', { status: 'error' })
      return
    }
    setSelectedMedia(media)
  }

  // 송출기간이 바뀌면 매체 가용성(available)이 달라지므로 기존 선택을 무효화한다
  const periodKey =
    period.start && period.end
      ? `${toApiDate(period.start)}~${toApiDate(period.end)}`
      : ''
  const prevPeriodKeyRef = useRef(periodKey)
  useEffect(() => {
    if (prevPeriodKeyRef.current !== periodKey) {
      prevPeriodKeyRef.current = periodKey
      setSelectedMedia(null)
    }
  }, [periodKey])

  const handleSidoChange = (next: string) => {
    setSido(next)
    setSigungu(ALL_SIGUNGU) // 시/도 변경 시 전체(해당 시/도 전체 매체)로
  }

  // 캠페인 등록 제출
  const [submitting, setSubmitting] = useState(false)

  const handleRegister = async () => {
    if (!selectedMedia || !upload.creativeToken) return
    if (user?.teamId == null) {
      toast('소속 팀 정보를 확인할 수 없습니다. 다시 로그인해 주세요.', {
        status: 'error',
      })
      return
    }
    setSubmitting(true)
    try {
      await createCampaign(user.teamId, {
        info: form.getValues(),
        mediaUnitId: Number(selectedMedia.id),
        creativeToken: upload.creativeToken,
      })
      toast('캠페인이 등록되었습니다.', { status: 'success' })
      clearDraft()
      navigate(ROUTES.campaigns)
    } catch (err) {
      const message =
        err instanceof CampaignApiError
          ? err.message
          : '캠페인 등록에 실패했습니다. 잠시 후 다시 시도해 주세요.'
      toast(message, { status: 'error' })
      setSubmitting(false)
    }
  }

  // 뒤로가기: 2·3단계는 이전 단계로, 1단계는 위저드를 벗어나 캠페인 리스트로
  const handleBack = () => {
    if (step > 1) {
      setStep((step - 1) as RegisterStep)
      return
    }
    // 1단계: 입력했거나 영상을 올린 상태면 이탈 확인 모달, 아무것도 없으면 바로 나감
    if (isFormDirty || upload.status !== 'idle') {
      setShowLeaveConfirm(true)
    } else {
      navigate(ROUTES.campaigns)
    }
  }

  return (
    // 헤더·본문 각각 p-x5(L2). 컨텐츠 영역 프레임 패딩(L1)은 AppShell이 제공.
    <section className="flex min-h-full flex-col">
      <header className="flex items-end justify-between gap-x5 p-x5">
        <div className="flex min-w-0 flex-1 flex-col gap-x2">
          {/* 뒤로가기 버튼(24×24)을 타이틀과 같은 행에 두어 세로 중앙 정렬 */}
          <div className="flex items-center gap-x1">
            <button
              type="button"
              aria-label="뒤로 가기"
              onClick={handleBack}
              className="flex size-[24px] shrink-0 cursor-pointer items-center justify-center rounded-x1 text-text-primary interaction-normal"
            >
              <Icon icon={ChevronLeft} size="large" />
            </button>
            <h1 className="min-w-0 truncate text-title-2-medium text-text-primary">
              캠페인 등록
            </h1>
          </div>
          {/* 부제목: 버튼(24)+gap(4)=28px 들여써 타이틀과 좌측 정렬 */}
          <p className="pl-[28px] text-heading-2-regular text-text-primary">
            {STEP_SUBTITLE[step]}
          </p>
        </div>
        <ProgressBar steps={REGISTER_STEPS} currentStep={step} />
      </header>

      <div className="flex flex-1 items-stretch gap-x5 p-x5">
        {step === 1 && (
          <>
            <VideoUploadCard
              status={upload.status}
              thumbnailUrl={upload.thumbnailUrl}
              onFileSelect={handleFileSelect}
              onCancel={handleUploadCancel}
              className="h-[661px] flex-1"
            />
            {/* 다음 활성 = 폼 유효 + 썸네일(미리보기) 표시됨. 실제 업로드 완료는 백그라운드라 여기서 안 막음 */}
            <CampaignInfoForm
              form={form}
              uploadReady={upload.thumbnailUrl != null}
              onNext={() => setStep(2)}
            />
          </>
        )}
        {step === 2 && (
          <div className="relative h-[640px] w-full overflow-hidden rounded-x3 border border-line-secondary">
            {/* 지도는 전체를 채우고, 리스트는 좌측에 rounded-x3 카드로 떠 있음 (Figma 구조).
                MediaMap 루트가 relative라 위치 충돌 방지 위해 래퍼가 absolute를 담당 */}
            <div className="absolute inset-0">
              <MediaMap
                className="size-full"
                mediaList={mediaList}
                regions={regions}
                sido={sido}
                sigungu={sigungu}
                onSidoChange={handleSidoChange}
                onSigunguChange={setSigungu}
                selectedMediaId={selectedMediaId}
                onSelectMedia={handleSelectMedia}
              />
            </div>
            {/* 패널 + 사이드 탭을 함께 슬라이드해 목록을 접고 편다 */}
            <div
              className={[
                'absolute inset-y-0 left-0 z-10 flex transition-transform duration-300',
                listCollapsed ? '-translate-x-[372px]' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <MediaListPanel
                className="h-full w-[372px] overflow-hidden rounded-x3 border border-line-secondary"
                mediaList={mediaList}
                loading={mediaLoading}
                hasMore={hasNextPage}
                loadingMore={isFetchingNextPage}
                onLoadMore={() => void fetchNextPage()}
                keyword={keyword}
                onKeywordChange={setKeyword}
                selectedMediaId={selectedMediaId}
                onSelectMedia={handleSelectMedia}
                onPrev={handleBack}
                onNext={() => setStep(3)}
              />
              <MediaListSideTab
                open={!listCollapsed}
                onToggle={() => setListCollapsed((v) => !v)}
                className="self-center"
              />
            </div>
          </div>
        )}
        {step === 3 && (
          <CampaignSummary
            info={form.getValues()}
            media={selectedMedia}
            uploadStatus={upload.status}
            thumbnailUrl={upload.thumbnailUrl}
            onFileSelect={handleFileSelect}
            onUploadCancel={handleUploadCancel}
            onEditInfo={() => setStep(1)}
            onEditMedia={() => setStep(2)}
            onSubmit={handleRegister}
            submitting={submitting}
          />
        )}
      </div>

      <Modal
        open={showLeaveConfirm}
        scoped
        title="캠페인 등록을 그만두시겠어요?"
        body={
          <>
            등록을 마치면 옥외광고 성과를 바로 확인할 수 있어요.
            <br />
            지금 나가면 입력한 내용은 저장되지 않습니다.
          </>
        }
        cancelText="계속 작성하기"
        confirmText="나가기"
        onClose={() => setShowLeaveConfirm(false)}
        onConfirm={() => navigate(ROUTES.campaigns)}
        className="!px-x5 !py-x8 !w-[360px]"
      />
    </section>
  )
}
