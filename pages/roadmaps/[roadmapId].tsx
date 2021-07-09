import Link from 'next/link'
import StepCardWithCheck from '~/components/list/StepCardWithCheck'
import AnimatedCircularProgressBar from '~/components/parts/AnimatedCircularProgressBar'
import BarMiddle from '~/components/parts/BarMiddle'
import BarVertex from '~/components/parts/BarVertex'
import RoadmapStatus from '~/components/parts/RoadmapStatus'
import Tag from '~/components/parts/Tag'
import UserIcon from '~/components/users/UserIcon'
import Trash from '~/components/parts/Trash'
import Button from '~/components/button/Button'
import useAspidaSWR from '@aspida/swr'
import { apiClient, headersAuthz } from '~/utils/apiClient'
import { useRouter } from 'next/router'
import { RoadmapInfo, StepInfo, UserWithoutPersonal } from '~/server/types'
import { useAuth } from '~/contexts/AuthContext'
import { comingSoon, formatDate } from '~/utils/utility'
import StepCard from '~/components/list/StepCard'
import AchieveModal from '~/components/modals/AchieveModal'
import { useEffect, useState } from 'react'
import { pushSigninWithPrevUrl } from '~/utils/auth'
import Layout from '~/components/Layout'
import ShareBtns from '~/components/roadmaps/ShareBtns'
import { getRoadmap } from '~/utils/roadmaps'

type ForkInfo = {
  title: RoadmapInfo['title']
  author: UserWithoutPersonal['name']
}
type HeaderProps = {
  roadmap: RoadmapInfo
  isMine: boolean
  onDeleteClick: () => void
  forkInfo?: ForkInfo
}
const Header = ({ roadmap, isMine, onDeleteClick, forkInfo }: HeaderProps) => {
  return (
    <div className={`max-w-3xl mx-auto`}>
      <div className={`flex mb-16`}>
        <div className={`flex-grow`}>
          <p className={`text-$t5 text-$shade1`}>{`最終更新 : ${formatDate(
            roadmap.updatedAt
          )}`}</p>
          <div className={`flex items-end mb-5`}>
            <h1 className={`text-$t1 text-$primary mr-12`}>{roadmap.title}</h1>
            {isMine ? (
              <div className={`pb-1`}>
                <Trash onClick={onDeleteClick} />
              </div>
            ) : (
              <></>
            )}
          </div>
          <div className={`flex mb-5`}>
            {roadmap.tags.map((tag, i) => (
              <Tag
                key={i}
                name={tag.name}
                className={`text-$t6 text-$indigo mr-3`}
              />
            ))}
          </div>
          <div>
            <RoadmapStatus
              forkedCount={roadmap.forkedCount}
              likedCount={roadmap.likedCount}
            />
          </div>
          {forkInfo && (
            <p className="mt-6 text-$T6 text-$indigo">
              copied from{' '}
              <span className="text-$t5">{`${forkInfo.title}  (${forkInfo.author})`}</span>
            </p>
          )}
        </div>

        <div className={`w-28`}>
          {isMine ? (
            <p className={`text-$t4 text-$accent1 text-center mb-4`}>
              <Link href={`/roadmaps/edit/${roadmap.id}`}>編集する</Link>
            </p>
          ) : (
            <p className={`h-8`}></p>
          )}

          <AnimatedCircularProgressBar
            finalValue={roadmap.donePercent}
            text={`${roadmap.donePercent}%`}
            className={`h-28`}
          />
        </div>
      </div>

      <div className={`flex py-8 px-10 border-2 border-$shade2 rounded-lg`}>
        <div className={`mr-10`}>
          <UserIcon src={roadmap.user.img || ''} size={14} />
        </div>
        <div>
          <p className={`text-$t4 text-$indigo mb-3`}>{roadmap.user.name}</p>
          <p className={`text-$t5 text-$primary`}>{roadmap.description}</p>
        </div>
      </div>
    </div>
  )
}

type StepsProps = {
  roadmap: RoadmapInfo
  isMine: boolean
  onCheckClick: (stepId: StepInfo['id']) => void
}
const Steps = ({ roadmap, isMine, onCheckClick }: StepsProps) => {
  let stepCards
  if (isMine) {
    stepCards = roadmap.steps.map((step, i) => (
      <div key={i}>
        <BarMiddle />
        <StepCardWithCheck
          src={step.library.img || ''}
          title={step.library.title}
          href={step.library.link || ''}
          memo={step.memo || ''}
          initialIsChecked={step.isDone}
          onCheckClick={() => onCheckClick(step.id)}
        />
        <BarMiddle />
      </div>
    ))
  } else {
    stepCards = roadmap.steps.map((step, i) => (
      <div key={i}>
        <BarMiddle />
        <StepCard
          src={step.library.img || ''}
          title={step.library.title}
          href={step.library.link || ''}
          memo={step.memo || ''}
        />
        <BarMiddle />
      </div>
    ))
  }
  return (
    <div className={`max-w-3xl mx-auto`}>
      <BarVertex />
      {stepCards}
      <BarVertex />
    </div>
  )
}
type GoalProps = {
  text: string
}
const Goal = ({ text }: GoalProps) => {
  return (
    <div className={`pb-16`}>
      <div className={`flex items-center max-w-6xl mx-auto`}>
        <hr className={`border border-$shade1 flex-grow`} />
        <p className={`text-$T1 text-$primary mx-11`}>GOAL!</p>
        <hr className={`border border-$shade1 flex-grow`} />
      </div>
      {/* <div className={`my-16 max-w-2xl mx-auto`}>
        {text && (
          <div className="flex flex-col justify-center text-center align-middle bg-$white rounded-3xl shadow-$rich px-7 py-8">
            <div className={`flex mb-5`}>楽しかった！</div>
            <p className={`text-$t2 text-$primary1`}>{`${text}`}</p>
          </div>
        )}
      </div> */}
      <div className={`my-16 max-w-2xl mx-auto`}>
        <div className="bg-$white rounded-3xl shadow-$rich px-7 py-8">
          <div className={`flex mb-5`}>
            <p
              className={`mr-9 text-$t2 text-$primary`}
            >{`JavaScript入門できた！`}</p>
          </div>
          <p
            className={`text-$t5 text-$shade1`}
          >{`意外と簡単だった！みんなもできる！時間にして約３ヶ月、よく頑張ったあ自分。`}</p>
        </div>
      </div>
    </div>
  )
}

type ForkBtnProps = {
  isMine: boolean
  onDoneClick: () => void
  onForkClick: () => void
}
const ForkBtn = ({ isMine, onDoneClick, onForkClick }: ForkBtnProps) => {
  const auth = useAuth()
  const router = useRouter()

  const handleForkClick = () => {
    if (auth.isLoggedIn) {
      onForkClick()
    } else {
      pushSigninWithPrevUrl(router)
    }
  }

  let btn
  if (isMine) {
    btn = (
      <Button
        bgColor={`$accent2`}
        text={`ゴールを達成した！`}
        onClick={onDoneClick}
      />
    )
  } else {
    btn = (
      <Button
        bgColor={`$accent1`}
        text={`このロードマップを始める！`}
        onClick={handleForkClick}
      />
    )
  }
  return <div className={`max-w-max mx-auto`}>{btn}</div>
}

const RoadmapPage = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [forkInfo, setForkInfo] = useState<ForkInfo>()
  const auth = useAuth()
  const router = useRouter()
  const { roadmapId } = router.query
  const { data: roadmap, error, revalidate } = useAspidaSWR(
    apiClient.roadmaps._roadmapId(
      typeof roadmapId === 'string' ? +roadmapId : 0
    )
  )

  useEffect(() => {
    if (!roadmap?.forkedRoadmapId) {
      return
    }
    getRoadmap(roadmap.forkedRoadmapId).then((originalRoadmap) => {
      setForkInfo({
        author: originalRoadmap.user.name,
        title: originalRoadmap.title
      })
    })
  }, [roadmap])

  if (error || !roadmap) return <div></div>
  let isMine = false
  if (auth.user?.id === roadmap.userId) {
    isMine = true
  }

  const handleDeleteClick = async () => {
    // FIXME: なぜかエラーが出たので、今回は実装しない。
    // await apiClient.roadmaps._roadmapId(roadmap.id).delete()
    comingSoon()
  }

  const handleCheckClick = async (stepId: StepInfo['id']) => {
    await apiClient.steps
      ._stepId(stepId)
      .isDone.patch({ config: { ...headersAuthz(auth.token) } })
    revalidate()
  }

  const handleDoneClick = async () => {
    await apiClient.roadmaps
      ._roadmapId(roadmap.id)
      .isDone.patch({ config: { ...headersAuthz(auth.token) } })
    revalidate()
    setIsOpen(!isOpen)
  }

  const handleForkClick = async () => {
    if (!auth.isLoggedIn) {
      pushSigninWithPrevUrl(router)
    } else {
      router.push(`/roadmaps/new?copiedFrom=${roadmap.id}`)
    }
  }

  const handleTwitterClick = async () => {
    // FIXME: OGP画像使うまでの仮対応
    const url = `https://navict-app.vercel.app${router.asPath}`
    const text = '面白いから見てね！'
    const hashtags = 'navict'
    window.open(
      `http://twitter.com/share?url=${url}&text=${text}&hashtags=${hashtags}`,
      '_blank'
    )
  }

  const handleLikeClick = async () => {
    if (!auth.user?.id) return
    if (typeof roadmapId !== 'string') return
    await apiClient.likes.post({
      body: { userId: auth.user.id, roadmapId: +roadmapId },
      config: { ...headersAuthz(auth.token) }
    })
  }

  return (
    <Layout>
      <div className="relative">
        <div className={`my-16`}>
          <Header
            roadmap={roadmap}
            isMine={isMine}
            onDeleteClick={handleDeleteClick}
            forkInfo={forkInfo}
          />
        </div>
        <div className={`py-16 bg-$tint`}>
          <Steps
            roadmap={roadmap}
            isMine={isMine}
            onCheckClick={handleCheckClick}
          />
        </div>
        <div className={`bg-$tint`}>
          <Goal text={roadmap.goal || ''} />
        </div>
        <div className={`py-24`}>
          <ForkBtn
            isMine={isMine}
            onDoneClick={handleDoneClick}
            onForkClick={handleForkClick}
          />
        </div>
        <div className="fixed top-1/2 right-20">
          <ShareBtns
            onTwitterClick={handleTwitterClick}
            onLikeClick={handleLikeClick}
          />
        </div>
        <AchieveModal setIsOpen={setIsOpen} isOpen={isOpen} />
      </div>
    </Layout>
  )
}
export default RoadmapPage
