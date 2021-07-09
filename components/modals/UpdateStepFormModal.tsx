import { Dialog } from '@headlessui/react'
import { SetStateAction } from 'react'
import { LibraryInfo } from '~/server/types'
import { Library } from '$prisma/client'
import { SelectOption } from '../parts/SelectInput'
import UpdateStepForm from '../roadmaps/step/UpdateStepForm'
import { StepWithLib } from '../roadmaps/RoadmapForm'

type Props = {
  isOpen: boolean
  setIsOpen: React.Dispatch<SetStateAction<boolean>>
  libTitleOptions: SelectOption[]
  libs: LibraryInfo[]
  handleLibInputChange: (keyword: string) => void
  onSearchLibraries: (keyword: string) => Promise<Library[]>
  onCreateLibrary: (
    title: string,
    link?: string | null | undefined
  ) => Promise<Library>
  steps: StepWithLib[]
  stepIndex: number
  updateStep: (index: number, step: StepWithLib) => void
}

const UpdateStepFormModal = ({
  isOpen,
  setIsOpen,
  handleLibInputChange,
  onSearchLibraries,
  onCreateLibrary,
  libTitleOptions,
  libs,
  stepIndex,
  steps,
  updateStep
}: Props) => {
  const handleSubmitStep = (step: StepWithLib) => {
    updateStep(stepIndex, step)
    setIsOpen(false)
  }
  return (
    <Dialog
      open={isOpen}
      onClose={() => setIsOpen(false)}
      className="fixed z-10 max-h-screen top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1/2 bg-$white rounded-2xl flex flex-col justify-center items-center shadow-$rich p-8 max-w-screen-lg"
    >
      <Dialog.Overlay />
      <Dialog.Title className="text-$t2 text-$primary text-center">
        ステップを編集
      </Dialog.Title>
      <UpdateStepForm
        handleLibInputChange={handleLibInputChange}
        onSearchLibraries={onSearchLibraries}
        onCreateLibrary={onCreateLibrary}
        libTitleOptions={libTitleOptions}
        libs={libs}
        onSubmitStep={handleSubmitStep}
        onClickCloseButton={() => setIsOpen(false)}
        step={steps[stepIndex]}
      />
    </Dialog>
  )
}

export default UpdateStepFormModal
