import { UserInfo } from '~/server/types'
import { projectStorage } from '../firebase/firebase'

export const uploadProfileImage = async (
  file: Blob | Uint8Array | ArrayBuffer,
  filename: UserInfo['id']
): Promise<string> => {
  const storageRef = projectStorage.ref(filename.toString())
  const snapshot = await storageRef.put(file)
  return await snapshot.ref.getDownloadURL()
}
