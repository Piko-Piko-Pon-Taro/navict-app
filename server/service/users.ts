import { PrismaClient } from '@prisma/client'
import type { Like, User } from '$prisma/client'
import * as admin from 'firebase-admin'
import { getRoadmapInfosByUserId, getRoadmapInfoById } from '$/service/roadmaps'
import type { RoadmapInfo, UserUpdateBody, UserWithoutPersonal } from '$/types'
import { userWithoutPersonalSelect } from '$/prisma/options'

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
  })
})

const prisma = new PrismaClient()

export const veriyfyUserViaFirebase = async (idToken: string) => {
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken)
    const user = await admin.auth().getUser(decodedToken.uid)
    return user
  } catch (error) {
    // no verified user
    console.log('verify-error', error)
    return null
  }
}

export const createUser = (
  name: User['name'],
  email: User['email'] | null,
  img: User['img'] | null,
  firebaseUid: User['firebaseUid']
) => prisma.user.create({ data: { name, email, img, firebaseUid } })

export const getUserInfoById = async (id: User['id']) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      ...userWithoutPersonalSelect,
      likes: true
    }
  })
  if (!user) return null

  const roadmapInfos = await getRoadmapInfosByUserId(id)

  const {
    likes, // eslint-disable-line @typescript-eslint/no-unused-vars
    ...userWithPersonal
  } = user
  const doingRoadmaps = roadmapInfos.filter((r) => !r.isDone)
  const doneRoadmaps = roadmapInfos.filter((r) => r.isDone)
  const likeRoadmaps = await getLikeRoadmaps(user.likes)
  const doneRoadmapsCount = doneRoadmaps.length
  const totalLikedCount = await getTotalLikedCountByUserId(id)

  return {
    ...userWithPersonal,
    doingRoadmaps,
    doneRoadmaps,
    likeRoadmaps,
    doneRoadmapsCount,
    totalLikedCount
  }
}

export const updateUser = async (
  id: User['id'],
  partialUser: UserUpdateBody
) => {
  const user = await prisma.user.update({
    where: { id },
    data: {
      name: partialUser.name,
      email: partialUser.email,
      bio: partialUser.bio,
      img: partialUser.img,
      twitterLink: partialUser.twitterLink,
      githubLink: partialUser.githubLink,
      websiteLink: partialUser.websiteLink
    }
  })
  return makeUserWithoutPersonal(user)
}

/**
 * TODO:
 * 実装する
 * firebaseのアカウントも削除する
 */
export const deleteUser = (id: User['id']) => {
  console.log(
    `User(id: ${id}) is not deleted, because that function has not been implemented yet.`
  )
}

const makeUserWithoutPersonal = (user: User): UserWithoutPersonal => {
  const {
    email, // eslint-disable-line @typescript-eslint/no-unused-vars
    firebaseUid, // eslint-disable-line @typescript-eslint/no-unused-vars
    ...userWithoutPersonal
  } = user
  return userWithoutPersonal
}

const getLikeRoadmaps = async (likes: Like[]): Promise<RoadmapInfo[]> => {
  const likeRoadmaps: RoadmapInfo[] = []
  for (const like of likes) {
    const roadmapInfo = await getRoadmapInfoById(like.roadmapId)
    if (!roadmapInfo) continue
    likeRoadmaps.push(roadmapInfo)
  }
  return likeRoadmaps
}

const getTotalLikedCountByUserId = async (id: User['id']): Promise<number> => {
  let likedCount = 0
  const roadmaps = await prisma.roadmap.findMany({
    where: { userId: id }
  })
  for (const roadmap of roadmaps) {
    likedCount += await prisma.like.count({
      where: { roadmapId: roadmap.id }
    })
  }
  return likedCount
}
