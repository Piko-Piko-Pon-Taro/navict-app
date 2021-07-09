import { useRouter } from 'next/router'
import React, { SetStateAction, useState } from 'react'
import { useAuth } from '~/contexts/AuthContext'
import UserIcon from '~/components/users/UserIcon'
import useAspidaSWR from '@aspida/swr'
import { apiClient, headersAuthz } from '~/utils/apiClient'
import Image from 'next/image'
import { RoadmapInfo, UserInfo } from '~/server/types'
import RoadmapCard from '~/components/list/RoadmapCard'
import { RoadmapCardType } from '~/components/list/RoadmapCard'
import { Roadmap } from '$prisma/client'
import NavictChan from '~/components/NavictChan'
import Layout from '~/components/Layout'
import ThreeDots from '$components/parts/ThreeDots'
import UpdateProfileModal from '~/components/modals/UpdateProfileModal'
import { ProfileFormSchema } from '~/components/users/UpdateProfileForm'
type SnsLinkProps = {
  type: 'twitter' | 'github' | 'website'
  link: string
}
const SnsLink = ({ type, link }: SnsLinkProps) => {
  if (!link) return <></>
  const srcObj = {
    twitter: '/brandIcon/twitterIconBlue.svg',
    github: '/brandIcon/githubIcon.svg',
    website: '/icon/webIcon.svg'
  }
  return (
    <a
      href={link}
      target="_blank"
      rel="noreferrer"
      className="flex items-center"
    >
      <Image src={srcObj[type]} alt="sns icon" width="24" height="24" />
      <div className={`text-$indigo text-$T6 ml-2`}>{link}</div>
    </a>
  )
}

type OtherProfileProps = {
  user: UserInfo
}
const OtherProfile = ({ user }: OtherProfileProps) => {
  return (
    <div className={`flex relative max-w-5xl mx-auto`}>
      <div className={`mr-6`}>
        <UserIcon userId={user.id} src={user.img || ''} size={24}></UserIcon>
      </div>
      <div className={`flex-grow`}>
        <p className={`text-$t2`}>{user.name}</p>
        <p className={`text-$t5 mb-2 whitespace-pre-wrap break-words`}>
          {user.bio}
        </p>
        {/* sns links */}
        <div className={`flex`}>
          <div className={`mr-5`}>
            <SnsLink type="twitter" link={user.twitterLink || ''} />
          </div>
          <div className={`mr-5`}>
            <SnsLink type="github" link={user.githubLink || ''} />
          </div>
          <div className={`mr-5`}>
            <SnsLink type="website" link={user.websiteLink || ''} />
          </div>
        </div>
      </div>
      <div className={`flex items-end`}>
        <div className={`flex`}>
          <div className={`flex flex-col items-center mr-8`}>
            <div className={`flex items-center`}>
              <div className={`mr-1 mb-1`}>
                <Image src={`/crown.svg`} width={20.87} height={16.14} />
              </div>
              <p className={`text-$T2 text-$accent3`}>
                {user.doneRoadmapsCount}
              </p>
            </div>
            <p className={`text-$shade1 text-$T6`}>完走数</p>
          </div>

          <div className={`flex flex-col items-center`}>
            <div className={`flex items-center`}>
              <div className={`mr-1`}>
                <Image
                  src={`/list/heart-fill.svg`}
                  width={18.25}
                  height={16.51}
                />
              </div>
              <p className={`text-$T2 text-$accent2`}>{user.totalLikedCount}</p>
            </div>
            <p className={`text-$shade1 text-$T6`}>総獲得いいね</p>
          </div>
        </div>
      </div>
    </div>
  )
}

type MyProfileProps = {
  user: UserInfo
  isProfileModalOpen: boolean
  setIsProfileModalOpen: React.Dispatch<SetStateAction<boolean>>
  onUpdateProfile: (data: ProfileFormSchema) => Promise<void>
}
const MyProfile = ({
  user,
  isProfileModalOpen,
  setIsProfileModalOpen,
  onUpdateProfile
}: MyProfileProps) => {
  return (
    <div className={`flex relative max-w-5xl mx-auto`}>
      <div className={`mr-6`}>
        <UserIcon userId={user.id} src={user.img || ''} size={24}></UserIcon>
      </div>
      <div className={`flex-grow`}>
        <p className={`text-$t2`}>{user.name}</p>
        <p className={`text-$t5 mb-2 whitespace-pre-wrap break-words`}>
          {user.bio}
        </p>
        {/* sns links */}
        <div className={`flex`}>
          <div className={`mr-5`}>
            <SnsLink type="twitter" link={user.twitterLink || ''} />
          </div>
          <div className={`mr-5`}>
            <SnsLink type="github" link={user.githubLink || ''} />
          </div>
          <div className={`mr-5`}>
            <SnsLink type="website" link={user.websiteLink || ''} />
          </div>
        </div>
      </div>
      <div className={`flex items-end`}>
        <div className={`flex`}>
          <div className={`flex flex-col items-center mr-8`}>
            <div className={`flex items-center`}>
              <div className={`mr-1 mb-1`}>
                <Image src={`/crown.svg`} width={20.87} height={16.14} />
              </div>
              <p className={`text-$T2 text-$accent3`}>
                {user.doneRoadmapsCount}
              </p>
            </div>
            <p className={`text-$shade1 text-$T6`}>完走数</p>
          </div>

          <div className={`flex flex-col items-center`}>
            <div className={`flex items-center`}>
              <div className={`mr-1`}>
                <Image
                  src={`/list/heart-fill.svg`}
                  width={18.25}
                  height={16.51}
                />
              </div>
              <p className={`text-$T2 text-$accent2`}>{user.totalLikedCount}</p>
            </div>
            <p className={`text-$shade1 text-$T6`}>総獲得いいね</p>
          </div>
        </div>
      </div>
      <div className={`absolute top-0 right-1`}>
        <div
          className="py-0.5 cursor-pointer"
          onClick={() => {
            if (setIsProfileModalOpen)
              setIsProfileModalOpen(!isProfileModalOpen)
          }}
        >
          <ThreeDots width={21} height={5} />
        </div>
        <UpdateProfileModal
          isOpen={isProfileModalOpen}
          setIsOpen={setIsProfileModalOpen}
          onUpdateProfile={onUpdateProfile}
        />
      </div>
    </div>
  )
}

type TabsProps = {
  index: number
  onClick: (index: number) => void
}
const Tabs = ({ index, onClick }: TabsProps) => {
  const tabs = ['実行中', '達成済み', 'いいね']
  return (
    <div className={`flex max-w-5xl mx-auto`}>
      {tabs.map((tab, i) => {
        return (
          <div
            key={i}
            className={`text-$primary text-$t2 w-1/3 text-center py-3 border-b-4 cursor-pointer ${
              i === index ? 'border-$accent1' : 'border-none'
            }`}
            onClick={() => onClick(i)}
          >
            {tab}
          </div>
        )
      })}
    </div>
  )
}

type RoadmapsProps = {
  index: number
  doingRoadmaps: RoadmapInfo[]
  doneRoadmaps: RoadmapInfo[]
  likeRoadmaps: RoadmapInfo[]
  onToggleLike: (roadmapId: Roadmap['id']) => void
}
const Roadmaps = ({
  index,
  doingRoadmaps,
  doneRoadmaps,
  likeRoadmaps,
  onToggleLike
}: RoadmapsProps) => {
  const roadmaps = (index: number) => {
    if (index === 0) {
      return doingRoadmaps
    } else if (index === 1) {
      return doneRoadmaps
    } else if (index === 2) {
      return likeRoadmaps
    } else {
      return doingRoadmaps
    }
  }
  const roadmapCardType = [
    RoadmapCardType.DOING,
    RoadmapCardType.DONE,
    RoadmapCardType.LIKE
  ]
  const isLiked = (roadmap: RoadmapInfo) =>
    !!likeRoadmaps.find((r) => r.id === roadmap.id)

  return (
    <div>
      {roadmaps(index).map((roadmap, i) => {
        return (
          <div
            key={roadmap.id}
            className={`max-w-5xl mx-auto ${i > 0 ? 'mt-11' : ''}`}
          >
            <RoadmapCard
              type={roadmapCardType[index]}
              isLiked={isLiked(roadmap)}
              roadmap={roadmap}
              onToggleLike={onToggleLike}
            />
          </div>
        )
      })}
    </div>
  )
}

// FIXME: MypagePage と UserPage とでごちゃついてるな…
const UserPage = ({ isInMypage = false }: { isInMypage?: boolean }) => {
  const router = useRouter()
  const { userId } = router.query

  const [index, setIndex] = useState<number>(0)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)

  const auth = useAuth()
  if (typeof userId === 'string' && +userId === auth.user?.id) {
    router.push('/mypage')
  }

  const { data: user, error, revalidate } = useAspidaSWR(
    apiClient.users._userId(
      (() => {
        // FIXME: 読めないよこんなの。
        if (isInMypage && auth.user?.id) {
          return auth.user.id
        } else if (typeof userId === 'string') {
          return +userId
        } else {
          return 0
        }
      })()
    )
  )

  // Update Profile
  const handleUpdateProfile = async (data: ProfileFormSchema) => {
    try {
      if (!auth.user) throw Error('you need to be logged in')
      await apiClient.users._userId(auth.user.id).$put({
        body: { ...data },
        config: { ...headersAuthz(auth.token) }
      })
      await auth.refreshAuth()
      revalidate()
    } catch (error) {
      console.error(error)
    }
  }

  if (error) return <div>failed to load</div>
  if (!user) return <NavictChan text={`LOADING...`} />

  const handleTabClick = (index: number) => {
    setIndex(index)
  }

  const handleToggleLike = (roadmapId: Roadmap['id']) => {
    if (!auth.isLoggedIn) return
    apiClient.likes.post({
      body: { userId: auth.user?.id || 0, roadmapId },
      config: { ...headersAuthz(auth.token) }
    })
  }

  return (
    <Layout>
      <div className={`pt-20`}>
        <div className={`mb-20`}>
          {isInMypage && (
            <MyProfile
              user={user}
              isProfileModalOpen={isProfileModalOpen}
              setIsProfileModalOpen={setIsProfileModalOpen}
              onUpdateProfile={handleUpdateProfile}
            />
          )}
          {!isInMypage && <OtherProfile user={user} />}
        </div>
        <div className={`mb-10`}>
          <Tabs index={index} onClick={handleTabClick} />
        </div>
        <div className={`pt-20 pb-24 bg-$tint`}>
          <Roadmaps
            index={index}
            doingRoadmaps={user.doingRoadmaps}
            doneRoadmaps={user.doneRoadmaps}
            likeRoadmaps={user.likeRoadmaps}
            onToggleLike={handleToggleLike}
          />
        </div>
      </div>
    </Layout>
  )
}

export default UserPage
