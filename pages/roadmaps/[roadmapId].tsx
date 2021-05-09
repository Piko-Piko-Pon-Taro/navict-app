import Link from 'next/link'
import StepCardWithCheck from '~/components/list/StepCardWithCheck'
import AnimatedCircularProgressBar from '~/components/parts/AnimatedCircularProgressBar'
import BarTop from '~/components/parts/BarTop'
import BarMiddle from '~/components/parts/BarMiddle'
import BarBottom from '~/components/parts/BarBottom'
import RoadmapStatus from '~/components/parts/RoadmapStatus'
import Tag from '~/components/parts/Tag'
import UserIcon from '~/components/UserIcon'
import Trash from '~/components/parts/Trash'
import Button from '~/components/button/Button'
import useAspidaSWR from '@aspida/swr'
import { apiClient } from '~/utils/apiClient'
import { useRouter } from 'next/router'
import { RoadmapInfo, StepInfo } from '~/server/types'
import { useAuth } from '~/contexts/AuthContext'
import { comingSoon, formatDate } from '~/utils/utility'
import StepCard from '~/components/list/StepCard'

type HeaderProps = {
  roadmap: RoadmapInfo
  isMine: boolean
  onDeleteClick: () => void
}
const Header = ({ roadmap, isMine, onDeleteClick }: HeaderProps) => {
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
        {i === 0 ? <></> : <BarMiddle />}
        <StepCardWithCheck
          src={step.library.img || ''}
          title={step.library.title}
          href={step.library.link || ''}
          memo={step.memo || ''}
          initialIsChecked={step.isDone}
          onCheckClick={() => onCheckClick(step.id)}
        />
      </div>
    ))
  } else {
    stepCards = roadmap.steps.map((step, i) => (
      <div key={i}>
        {i === 0 ? <></> : <BarMiddle />}
        <StepCard
          src={step.library.img || ''}
          title={step.library.title}
          href={step.library.link || ''}
          memo={step.memo || ''}
        />
      </div>
    ))
  }
  return (
    <div className={`max-w-3xl mx-auto`}>
      <BarTop />
      {stepCards}
      <BarBottom />
    </div>
  )
}

const Goal = () => {
  return (
    <div className={`pb-16`}>
      <div className={`flex items-center max-w-6xl mx-auto`}>
        <hr className={`border border-$shade1 flex-grow`} />
        <p className={`text-$T1 text-$primary mx-11`}>GOAL!</p>
        <hr className={`border border-$shade1 flex-grow`} />
      </div>

      <div className={`my-16 max-w-2xl mx-auto`}>
        <div className="bg-$white rounded-3xl shadow-$rich px-7 py-8">
          <div className={`flex mb-5`}>
            <p
              className={`mr-9 text-$t2 text-$primary`}
            >{`Python入門できた！`}</p>
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
        onClick={onForkClick}
      />
    )
  }
  return <div className={`max-w-max mx-auto`}>{btn}</div>
}

const RoadmapPage = () => {
  const auth = useAuth()
  const router = useRouter()
  const { roadmapId } = router.query
  const { data: roadmap, error, revalidate } = useAspidaSWR(
    apiClient.roadmaps._roadmapId(
      typeof roadmapId === 'string' ? +roadmapId : 0
    )
  )
  if (error || !roadmap) return <div>failed to load</div>
  let isMine = false
  if (auth?.user?.id === roadmap.userId) {
    isMine = true
  }

  const handleDeleteClick = async () => {
    // FIXME: なぜかエラーが出たので、今回は実装しない。
    // await apiClient.roadmaps._roadmapId(roadmap.id).delete()
    comingSoon()
  }

  const handleCheckClick = async (stepId: StepInfo['id']) => {
    await apiClient.steps._stepId(stepId).isDone.patch()
    revalidate()
  }

  const handleDoneClick = async () => {
    await apiClient.roadmaps._roadmapId(roadmap.id).isDone.patch()
    revalidate()
  }

  const handleForkClick = async () => {
    // FIXME: 今度実装する
    comingSoon()
  }

  return (
    <div>
      <div className={`my-16`}>
        <Header
          roadmap={roadmap}
          isMine={isMine}
          onDeleteClick={handleDeleteClick}
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
        <Goal />
      </div>
      <div className={`py-24`}>
        <ForkBtn
          isMine={isMine}
          onDoneClick={handleDoneClick}
          onForkClick={handleForkClick}
        />
      </div>
    </div>
  )
}

export default RoadmapPage