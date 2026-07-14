import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import CampaignInfoForm from '@/components/campaign/CampaignInfoForm'
import CampaignSummary from '@/components/campaign/CampaignSummary'
import MediaListPanel from '@/components/campaign/MediaListPanel'
import MediaMap from '@/components/campaign/MediaMap'
import VideoUploadCard from '@/components/campaign/VideoUploadCard'
import type { UploadStatus } from '@/components/campaign/VideoUploadCard'
import { Icon, ProgressBar, useToast } from '@/components/ui'
import {
  campaignInfoSchema,
  createCampaign,
  fetchCampaignMedia,
  uploadCampaignVideo,
} from '@/lib/campaign'
import type { CampaignInfoValues, CampaignMedia } from '@/lib/campaign'

const REGISTER_STEPS = ['기본 정보', '매체 선택', '최종 확인']

type RegisterStep = 1 | 2 | 3

const STEP_SUBTITLE: Record<RegisterStep, string> = {
  1: '광고 영상 및 기본 정보를 입력하세요.',
  2: '광고를 송출할 매체를 선택하세요.',
  3: '마지막으로 입력한 정보가 올바른지 확인하세요.',
}

interface UploadState {
  status: UploadStatus
  file: File | null
  /** success 시 영상 미리보기용 objectURL — 교체/이탈 시 revoke 필요 */
  previewUrl: string | null
  videoId: string | null
}

const INITIAL_UPLOAD: UploadState = {
  status: 'idle',
  file: null,
  previewUrl: null,
  videoId: null,
}

/**
 * 캠페인 등록 — 3단계 위저드 (기본 정보 → 매체 선택 → 최종 확인).
 * 폼·업로드·매체 선택 상태는 단계 왕복에도 보존되도록 전부 이 페이지가 소유한다
 * (step 컴포넌트는 전환 시 언마운트되므로 하위에 상태를 두지 않는다)
 */
export default function CampaignRegisterPage() {
  const navigate = useNavigate()
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
  // mock은 abort가 불가하므로 시퀀스 토큰으로 취소·재업로드 이후 도착한 응답을 무시
  const uploadSeqRef = useRef(0)

  // 페이지 이탈 시 objectURL 누수 방지
  const previewUrlRef = useRef<string | null>(null)
  previewUrlRef.current = upload.previewUrl
  useEffect(() => {
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current)
    }
  }, [])

  const handleFileSelect = (file: File) => {
    // accept="video/*"는 드래그&드롭을 막지 못하므로 형식을 재검증
    if (!file.type.startsWith('video/')) {
      toast('영상 파일만 업로드할 수 있습니다.', { status: 'error' })
      return
    }
    if (upload.previewUrl) URL.revokeObjectURL(upload.previewUrl)
    const seq = ++uploadSeqRef.current
    setUpload({ status: 'uploading', file, previewUrl: null, videoId: null })
    uploadCampaignVideo(file)
      .then(({ videoId }) => {
        if (seq !== uploadSeqRef.current) return // 취소·재업로드로 무효화된 응답
        setUpload({
          status: 'success',
          file,
          previewUrl: URL.createObjectURL(file),
          videoId,
        })
        toast('영상 업로드가 완료되었습니다.', { status: 'success' })
      })
      .catch(() => {
        if (seq !== uploadSeqRef.current) return
        setUpload({ status: 'error', file, previewUrl: null, videoId: null })
        toast('영상 업로드에 실패했습니다. 다시 시도하세요.', {
          status: 'error',
        })
      })
  }

  const handleUploadCancel = () => {
    uploadSeqRef.current += 1
    setUpload(INITIAL_UPLOAD)
  }

  // 매체 선택 — 카드·지도 핀이 하나의 선택 상태를 공유하도록 페이지가 소유
  const [mediaList, setMediaList] = useState<CampaignMedia[]>([])
  const [mediaLoading, setMediaLoading] = useState(true)
  const [selectedMediaId, setSelectedMediaId] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    fetchCampaignMedia()
      .then((list) => {
        if (active) setMediaList(list)
      })
      .finally(() => {
        if (active) setMediaLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const selectedMedia =
    mediaList.find((media) => media.id === selectedMediaId) ?? null

  // 캠페인 등록 제출
  const [submitting, setSubmitting] = useState(false)

  const handleRegister = async () => {
    if (!selectedMedia || !upload.videoId) return
    setSubmitting(true)
    try {
      await createCampaign({
        ...form.getValues(),
        mediaId: selectedMedia.id,
        videoId: upload.videoId,
      })
      toast('캠페인이 등록되었습니다.', { status: 'success' })
      navigate('/campaigns')
    } catch {
      toast('캠페인 등록에 실패했습니다. 잠시 후 다시 시도해 주세요.', {
        status: 'error',
      })
      setSubmitting(false)
    }
  }

  // 뒤로가기: 2·3단계는 이전 단계로, 1단계는 위저드를 벗어나 캠페인 리스트로
  const handleBack = () => {
    if (step > 1) setStep((step - 1) as RegisterStep)
    else navigate('/campaigns')
  }

  return (
    // p-x5: Figma Container 패딩 (구 레이아웃 wrapper가 주던 것 — AppShell은 패딩이 없어 페이지가 소유).
    // pb-[80px]: 기본 높이(890)를 넘는 경우 최하단 여백 80px (Figma 가이드)
    <section className="flex min-h-full flex-col p-x5 pb-[80px]">
      <header className="flex items-end justify-between gap-x5 p-x5">
        <div className="flex min-w-0 flex-1 items-start">
          <button
            type="button"
            aria-label="뒤로 가기"
            onClick={handleBack}
            className="cursor-pointer rounded-x1 py-[7px] text-text-primary interaction-normal"
          >
            <Icon icon={ChevronLeft} size="large" />
          </button>
          <div className="flex min-w-0 flex-col gap-x2 px-x1">
            <h1 className="text-title-2-medium text-text-primary">
              캠페인 등록
            </h1>
            <p className="text-heading-2-regular text-text-primary">
              {STEP_SUBTITLE[step]}
            </p>
          </div>
        </div>
        <ProgressBar
          steps={REGISTER_STEPS}
          currentStep={step}
          className="w-[225px] shrink-0"
        />
      </header>

      <div className="flex flex-1 items-stretch gap-x5 p-x5">
        {step === 1 && (
          <>
            <VideoUploadCard
              status={upload.status}
              previewUrl={upload.previewUrl}
              onFileSelect={handleFileSelect}
              onCancel={handleUploadCancel}
              className="min-h-[608px] min-w-[470px] flex-1 lg:max-w-[552px]"
            />
            <CampaignInfoForm form={form} onNext={() => setStep(2)} />
          </>
        )}
        {step === 2 && (
          <div className="relative min-h-[640px] w-full overflow-hidden rounded-x4 border border-line-secondary">
            {/* 리스트 패널이 불투명하므로 지도는 패널 오른쪽 영역만 차지 (지역 드롭다운이 지도 좌상단에 오도록).
                MediaMap 루트가 relative라 포지셔닝은 래퍼가 담당 */}
            <div className="absolute inset-y-0 left-[372px] right-0">
              <MediaMap
                className="size-full"
                mediaList={mediaList}
                selectedMediaId={selectedMediaId}
                onSelectMedia={setSelectedMediaId}
              />
            </div>
            <MediaListPanel
              className="absolute inset-y-0 left-0 z-10 w-[372px] border-r border-line-secondary"
              mediaList={mediaList}
              loading={mediaLoading}
              selectedMediaId={selectedMediaId}
              onSelectMedia={setSelectedMediaId}
              onPrev={handleBack}
              onNext={() => setStep(3)}
            />
          </div>
        )}
        {step === 3 && (
          <CampaignSummary
            info={form.getValues()}
            media={selectedMedia}
            uploadStatus={upload.status}
            previewUrl={upload.previewUrl}
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
