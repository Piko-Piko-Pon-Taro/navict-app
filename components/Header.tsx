import Image from 'next/image'
import Link from 'next/link'
import { useAuth } from '~/contexts/AuthContext'
import UserIcon from './users/UserIcon'
import { Menu } from '@headlessui/react'
import { useRouter } from 'next/router'
import ButtonSmall from './button/ButtonSmall'

const UserIconMenu = () => {
  const auth = useAuth()
  const router = useRouter()
  const logout = async () => {
    try {
      await auth.logout()
      router.reload()
    } catch (error) {
      console.error(error.message)
    }
  }
  return (
    <div className="relative">
      <Menu>
        <Menu.Button className="ml-4 cursor-pointer">
          <UserIcon src={auth.user?.img || ''} />
        </Menu.Button>
        <Menu.Items className="flex flex-col absolute left-0 top-14 w-60 rounded-3xl bg-$white shadow-$rich py-4 px-4 text-$t4">
          <Menu.Item>
            {({ active }) => (
              <div
                onClick={() => router.push('/mypage')}
                className={`py-2 px-2 rounded-lg text-$primary ${
                  active ? 'bg-$accent1 bg-opacity-10' : ''
                }`}
              >
                <a className="w-36">個人ページへ</a>
              </div>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <div
                onClick={logout}
                className={`py-2 px-2 rounded-lg text-$accent2 cursor-pointer ${
                  active ? 'bg-$accent1 bg-opacity-10' : ''
                }`}
              >
                ログアウト
              </div>
            )}
          </Menu.Item>
        </Menu.Items>
      </Menu>
    </div>
  )
}

export enum HEADER_BTN_TYPES {
  SAVE
}
type HeaderProps = {
  type?: HEADER_BTN_TYPES
  onSave?: () => void
}
const headerBtnStyles = {
  width: 'w-44'
}
const Header = ({ type, onSave }: HeaderProps) => {
  const auth = useAuth()
  return (
    <div className="flex justify-between items-center px-10 mx-auto py-10">
      <div className="flex py-1">
        <div className={`mr-4 cursor-pointer`}>
          <Link href="/">
            <a>
              <Image src={`/logo.svg`} width={129} height={35.27} />
            </a>
          </Link>
        </div>

        <form className="flex items-center relative w-1/2" action={`/search`}>
          <div className="flex items-center absolute top-50 left-4 text-$ cursor-text">
            <Image src="/header/search.svg" width="20" height="20" />
          </div>
          <input
            type="text"
            name="keyword"
            placeholder="ロードマップを検索"
            className="py-1 pl-12 border-2 border-$shade1 border-opacity-5 rounded-md text-$t4 text-$primary placeholder-$shade1"
          />
        </form>
      </div>

      {!auth.isLoggedIn && (
        <Link href="/signin">
          <a>
            <ButtonSmall
              text="ログイン"
              className={`${headerBtnStyles.width}`}
            />
          </a>
        </Link>
      )}

      {auth.isLoggedIn && (
        <div className="flex items-center">
          {!!auth.user?.img && (
            <div className="mr-7">
              <UserIconMenu />
            </div>
          )}
          {type === HEADER_BTN_TYPES.SAVE && (
            <ButtonSmall
              text="保存"
              onClick={onSave}
              className={`${headerBtnStyles.width}`}
            />
          )}
          {type !== HEADER_BTN_TYPES.SAVE && (
            <Link href="/roadmaps/new">
              <a>
                <ButtonSmall
                  text="新規作成"
                  iconImg="/pencil.svg"
                  className={`${headerBtnStyles.width}`}
                />
              </a>
            </Link>
          )}
        </div>
      )}
    </div>
  )
}

export default Header
