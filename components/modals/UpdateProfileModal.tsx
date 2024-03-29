import { Dialog } from '@headlessui/react'
import { SetStateAction } from 'react'
import Cross from '../parts/Cross'
import UpdateProfileForm, {
  ProfileFormSchema
} from '$components/users/UpdateProfileForm'

type UpdateProfileModalProps = {
  isOpen: boolean
  setIsOpen: React.Dispatch<SetStateAction<boolean>>
  onUpdateProfile: (data: ProfileFormSchema) => Promise<void>
}
const UpdateProfileModal = ({
  isOpen,
  setIsOpen,
  onUpdateProfile
}: UpdateProfileModalProps) => {
  const handleSubmit = async (data: ProfileFormSchema) => {
    setIsOpen(false)
    await onUpdateProfile(data)
  }
  return (
    <Dialog
      open={isOpen}
      onClose={() => setIsOpen(false)}
      className="fixed z-10 w-9/12 max-w-6xl top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-$white rounded-2xl flex flex-col justify-center items-center shadow-$rich py-4"
    >
      <Dialog.Overlay className="bg-$primary" />
      <div
        className="flex w-full scrollbar-hide overflow-y-scroll mt-14"
        style={{ maxHeight: '80vh' }}
      >
        <UpdateProfileForm onSaveButtonClick={handleSubmit} />
        <div className="cursor-pointer ml-auto absolute top-10 right-10">
          <Cross onClick={() => setIsOpen(false)} />
        </div>
      </div>
    </Dialog>
  )
}

export default UpdateProfileModal
