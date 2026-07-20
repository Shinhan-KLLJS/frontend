import { useEffect, useRef, useState } from 'react'
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
import { Icon, ProgressBar, useToast } from '@/components/ui'
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

/**
 * 캠페인 등록 — 3단계 위저드 (기본 정보 → 매체 선택 → 최종 확인).
 * 폼·업로드·매체 선택 상태는 단계 왕복에도 보존되도록 전부 이 페이지가 소유한다
 * (step 컴포넌트는 전환 시 언마운트되므로 하위에 상태를 두지 않는다)
 */
export default function CampaignRegisterPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [step, setStep] = useState<RegisterStep>(1)

  // Step1 기본 정보 폼 — 단계를 오가도 값이 유지되도록 페이지가 인스턴스를 소유
  const form = useForm<CampaignInfoValues>({
    resolver: zodResolver(campaignInfoSchema),
    mode: 'onTouched',
    defaultValues: {
      name: '',
      brand: '',
      period: {},
      dailyPlayCount: '',
      memo: '',
    },
  })

  // 영상 업로드 — 단계 이동 후에도 진행·토스트가 이어지도록 페이지가 상태를 소유
  const { toast } = useToast()
  const [upload, setUpload] = useState<UploadState>(INITIAL_UPLOAD)
  // abort가 불가하므로 시퀀스 토큰으로 취소·재업로드 이후 도착한 응답을 무시
  const uploadSeqRef = useRef(0)

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
  // 진입 기본: 서울특별시 전체 매체 (지도는 중구 부근에서 시작해 결과로 맞춰짐)
  const [sigungu, setSigungu] = useState(ALL_SIGUNGU)
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

  const { data: mediaList = [], isPending: mediaLoading } = useMediaUnits(
    onStep2,
    mediaQuery,
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
    if (step > 1) setStep((step - 1) as RegisterStep)
    else navigate(ROUTES.campaigns)
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
    </section>
  )
}
