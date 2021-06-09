import Layout from '~/components/Layout'
import UserPage from './users/[userId]'
import { useAuth } from '~/contexts/AuthContext'
import { useRouter } from 'next/router'
import { pushSigninWithPrevUrl } from '~/utils/auth'

const MypagePage = () => {
  const auth = useAuth()
  const router = useRouter()

  if (!auth?.isLoggedIn) {
    pushSigninWithPrevUrl(router)
  }

  return (
    <Layout>
      <UserPage isInMypage={true} />
    </Layout>
  )
}

export default MypagePage
