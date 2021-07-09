import { FieldValues, useForm, UseFormRegister } from 'react-hook-form'
import { User } from '$prisma/client'
import RHFInput from '../parts/RHFInput'
import RHFTextarea from '../parts/RHFTextarea'
import { useAuth } from '~/contexts/AuthContext'
import UserIcon from './UserIcon'
import ButtonSmall from '../button/ButtonSmall'
import { useEffect, useState } from 'react'
import { uploadProfileImage } from '~/utils/users'
import LinkIcon from '../parts/LinkIcon'

export type ProfileFormSchema = {
  img: User['img']
  name?: User['name']
  bio?: User['bio']
  twitterLink?: User['twitterLink']
  githubLink?: User['githubLink']
  websiteLink?: User['websiteLink']
}

type UpdateProfileFormProps = {
  onSaveButtonClick: (data: ProfileFormSchema) => Promise<void>
}

const UpdateProfileForm = ({ onSaveButtonClick }: UpdateProfileFormProps) => {
  const [url, setUrl] = useState<string>()
  const [imgElm, setImgElm] = useState<HTMLElement | null>()
  const [blob, setBlob] = useState<Blob | null>(null)
  const auth = useAuth()
  const {
    register,
    setValue,
    handleSubmit
    // formState: { errors } TODO: errorバリデーション
  } = useForm<ProfileFormSchema>()

  const editImg = () => {
    imgElm?.click()
  }

  const onChangeImg = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return

    const img = new Image()
    img.src = URL.createObjectURL(e.target.files[0])
    img.addEventListener(
      'load',
      function () {
        const canvas = document.createElement('canvas')
        // TODO: 画像の圧縮したほうがいいかも
        // TODO: 画像の切り抜き位置選べるようにしたい
        const size = Math.min(this.width, this.height)
        if (size < 300) {
          if (!e.target.files) return

          setUrl(URL.createObjectURL(e.target.files[0]))
          return
        }
        canvas.width = size
        canvas.height = size
        const ctx = canvas.getContext('2d')

        if (!ctx) return
        ctx.drawImage(
          this,
          0,
          0,
          Math.max(size, 100),
          Math.max(size, 100),
          0,
          0,
          Math.max(size, 100),
          Math.max(size, 100)
        )
        canvas.toBlob((b) => {
          if (!b || !auth.user) return
          setBlob(b)
          setUrl(URL.createObjectURL(b))
        })
      },
      { once: true }
    )
  }

  const handleSaveButtonClick = async (data: ProfileFormSchema) => {
    if (!auth.user) return
    if (blob) {
      const url = await uploadProfileImage(blob, auth.user.id)
      setValue('img', url)
      await onSaveButtonClick({ ...data, img: url })
    } else {
      await onSaveButtonClick({ ...data })
    }
  }

  useEffect(() => {
    setImgElm(document.getElementById('profile-img'))
  }, [])

  return (
    <div className="w-full px-20">
      <div className="w-$max-content mx-auto">
        <UserIcon src={url ? url || '' : auth.user?.img || ''} size={20} />
        <p onClick={editImg} className="text-$indigo text-$t4 cursor-pointer">
          写真を変更
        </p>
      </div>
      <form className="w-full" onSubmit={handleSubmit(handleSaveButtonClick)}>
        <input
          id="profile-img"
          onChange={onChangeImg}
          type="file"
          accept="image/*"
          hidden
        />
        <p className="text-$t4 mb-2 mt-5">ユーザー名</p>
        <RHFInput
          className="w-full py-3 px-5 bg-$shade3 border border-$shade1 rounded-xl text-$t5"
          name="name"
          defaultValue={auth.user?.name}
          register={(register as unknown) as UseFormRegister<FieldValues>}
        />
        <p className="text-$t4 mb-2 mt-8">プロフィール</p>
        <RHFTextarea
          className="w-full h-24 py-3 px-5 bg-$shade3 border border-$shade1 rounded-xl text-$t5"
          register={(register as unknown) as UseFormRegister<FieldValues>}
          name="bio"
          defaultValue={auth.user?.bio || undefined}
        />
        <div className="flex flex-col">
          <p className="text-$t4 mb-2 mt-8">SNS</p>
          <div className="flex items-center mb-6">
            <div className="w-14 mr-2">
              <LinkIcon type="twitter" text="twitter" width={20} height={20} />
            </div>
            <RHFInput
              className="w-full py-3 px-5 bg-$shade3 border border-$shade1 rounded-xl text-$t5"
              name="twitterLink"
              defaultValue={auth.user?.twitterLink || undefined}
              placeholder="https://twitter.com"
              register={(register as unknown) as UseFormRegister<FieldValues>}
            />
          </div>
          <div className="flex items-center mb-6">
            <div className="w-14 mr-2">
              <LinkIcon type="github" text="github" width={20} height={20} />
            </div>
            <RHFInput
              className="w-full py-3 px-5 bg-$shade3 border border-$shade1 rounded-xl text-$t5"
              name="githubLink"
              defaultValue={auth.user?.githubLink || undefined}
              placeholder="https://github.com"
              register={(register as unknown) as UseFormRegister<FieldValues>}
            />
          </div>
          <div className="flex items-center mb-8">
            <div className="w-14 mr-2">
              <LinkIcon type="web" text="web" width={20} height={20} />
            </div>
            <RHFInput
              className="w-full py-3 px-5 bg-$shade3 border border-$shade1 rounded-xl text-$t5"
              name="websiteLink"
              defaultValue={auth.user?.websiteLink || undefined}
              placeholder="URLを入力"
              register={(register as unknown) as UseFormRegister<FieldValues>}
            />
          </div>
        </div>
        <div className="flex justify-center mb-20">
          <ButtonSmall text="保存" type="submit" />
        </div>
      </form>
    </div>
  )
}

export default UpdateProfileForm
