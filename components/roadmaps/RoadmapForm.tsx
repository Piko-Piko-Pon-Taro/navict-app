import React, {
  Dispatch,
  RefObject,
  SetStateAction,
  useEffect,
  useState
} from 'react'
import type {
  RoadmapInfo,
  LibraryInfo,
  TagInfo,
  RecommendedLibraryInfo
} from '$/types/index'
import { Step, Library } from '$prisma/client'
import {
  Control,
  Controller,
  ControllerRenderProps,
  FieldValues,
  SubmitHandler,
  useForm,
  UseFormRegister
} from 'react-hook-form'
import ButtonSmall from '~/components/button/ButtonSmall'
import RHFInput from '~/components/parts/RHFInput'
import RHFTextarea from '~/components/parts/RHFTextarea'
import BarVertex from '$components/parts/BarVertex'
import StepCard from '~/components/list/StepCard'
import BarMiddle from '~/components/parts/BarMiddle'
import StepForm from '~/components/roadmaps/step/StepForm'
import SelectInput, { SelectOption } from '~/components/parts/SelectInput'
import { searchTags } from '~/utils/tags'
import {
  createLibrary,
  getRecommendedLibraries,
  makeLibTitleOptions,
  searchLibraries
} from '~/utils/libraries'
import GoalForm from '~/components/roadmaps/goal/GoalForm'
import Opener from '~/components/parts/Opener'
import UpdateStepFormModal from '../modals/UpdateStepFormModal'
import { useAuth } from '~/contexts/AuthContext'
import { useRouter } from 'next/router'
import { pushSigninWithPrevUrl } from '~/utils/auth'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import type { DropResult } from 'react-beautiful-dnd'

export type StepWithLib = Pick<
  Step,
  'memo' | 'nextStepId' | 'isDone' | 'libraryId'
> & { library: LibraryInfo }

export type RoadmapFormSchema = {
  title: RoadmapInfo['title']
  tagSelect?: SelectOption[]
  description?: RoadmapInfo['description']
  goal?: RoadmapInfo['goal']
}

type RoadmapProps = {
  defaultRoadmap?: RoadmapInfo
  steps: StepWithLib[]
  setSteps: Dispatch<SetStateAction<StepWithLib[]>>
  onCreateLibrary: (
    title: string,
    link?: string | null | undefined
  ) => Promise<Library>
  onSubmitForm: SubmitHandler<RoadmapFormSchema>
  buttonRef: RefObject<HTMLButtonElement>
  onStepDragEnd: (result: DropResult) => void
}

const RoadmapForm = ({
  defaultRoadmap,
  steps,
  setSteps,
  onCreateLibrary,
  onSubmitForm,
  buttonRef,
  onStepDragEnd
}: RoadmapProps) => {
  const auth = useAuth()
  if (!auth || !auth.token) return <div>not logged in</div>
  const [tagOptions, setTagOptions] = useState<SelectOption[]>([])
  const [libTitleOptions, setLibTitleOptions] = useState<SelectOption[]>([])
  const [libs, setLibs] = useState<LibraryInfo[]>([]) // search results
  const [isStepFormOpen, setIsStepFormOpen] = useState<boolean>(false)
  const [isUpdateStepFormOpen, setIsUpdateStepFormOpen] = useState<boolean>(
    false
  )
  const [recLibs, setRecLibs] = useState<RecommendedLibraryInfo[]>([])
  const [updateStepLibTitleOptions, setUpdateStepLibTitleOptions] = useState<
    SelectOption[]
  >([])
  const [updateStepLibs, setUpdateStepLibs] = useState<LibraryInfo[]>([])

  const [updateStepIndex, setUpdateStepIndex] = useState<number | undefined>(
    undefined
  )

  const {
    register,
    handleSubmit,
    control,
    setValue
    // formState: { errors } TODO: errorバリデーション
  } = useForm<RoadmapFormSchema>()

  // set default values (title,tags,steps...etc) if there is one
  useEffect(() => {
    if (!defaultRoadmap) return
    const defaultTagOptions = defaultRoadmap.tags.map(
      (tag) =>
        ({ index: tag.id, label: tag.name, value: tag.name } as SelectOption)
    )
    setValue('title', defaultRoadmap.title)
    setValue('tagSelect', defaultTagOptions)
    setValue('description', defaultRoadmap.description)
    setSteps(defaultRoadmap.steps)
    setValue('goal', defaultRoadmap.goal)
  }, [])

  const handleTagInputChange = (keyword: string) => {
    if (keyword.length === 1) {
      searchTags(keyword).then((tags) => {
        const newTagOptions = makeTagOptions(tags)
        setTagOptions(newTagOptions)
      })
    }
    if (keyword.length === 0) {
      setTagOptions([])
    }
  }
  const makeTagOptions = (tags: TagInfo[]) => {
    return tags.map((tag) => ({
      value: tag.name,
      label: tag.name
    }))
  }

  const addStep = (step: StepWithLib) => {
    setSteps([...steps, step])
  }

  const deleteStep = (index: number) => {
    const newSteps = steps.filter((step, i) => i !== index)
    setSteps(newSteps)
  }

  const toggleShowForm = () => {
    setIsStepFormOpen(!isStepFormOpen)
  }

  const handleLibInputChange = (keyword: string) => {
    if (keyword.length === 1) {
      searchLibraries(keyword).then((libraries) => {
        const newLibraryOptions = makeLibTitleOptions(libraries)
        setLibTitleOptions(newLibraryOptions)
        setLibs(libraries)
      })
    }
    if (keyword.length === 0) {
      setLibTitleOptions([])
    }
  }
  const handleUpdateStepLibInputChange = (keyword: string) => {
    if (keyword.length === 1) {
      searchLibraries(keyword).then((libraries) => {
        const newLibraryOptions = makeLibTitleOptions(libraries)
        setUpdateStepLibTitleOptions(newLibraryOptions)
        setUpdateStepLibs(libraries)
      })
    }
    if (keyword.length === 0) {
      setUpdateStepLibTitleOptions([])
    }
  }

  const getCurrentRecLibs = async () => {
    let ids = steps.slice(-3).map((step) => step.libraryId)
    while (ids.length < 3) {
      ids = [0, ...ids]
    }
    const result = await getRecommendedLibraries(
      ids as [number, number, number]
    )
    setRecLibs(result)
  }

  const openUpdateStepModal = (index: number) => {
    setUpdateStepIndex(index)
    setIsUpdateStepFormOpen(true)
  }

  const updateStep = (index: number, step: StepWithLib) => {
    const newSteps = [...steps]
    newSteps[index] = { ...step }
    setSteps(newSteps)
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmitForm)}
      className="flex flex-col items-center text-$primary text-$t4"
    >
      {/* basic info section */}
      <div className="max-w-screen-lg w-full">
        <BasicInfo
          register={register}
          tagOptions={tagOptions}
          control={control}
          onTagInputChange={handleTagInputChange}
        />
      </div>
      {/* create step section */}
      <div className="bg-$tint py-16 w-full flex items-center flex-col">
        {updateStepIndex !== undefined && (
          <UpdateStepFormModal
            isOpen={isUpdateStepFormOpen}
            setIsOpen={setIsUpdateStepFormOpen}
            libs={updateStepLibs}
            handleLibInputChange={handleUpdateStepLibInputChange}
            onSearchLibraries={searchLibraries}
            onCreateLibrary={onCreateLibrary}
            libTitleOptions={updateStepLibTitleOptions}
            steps={steps}
            stepIndex={updateStepIndex}
            updateStep={updateStep}
          />
        )}
        <BarVertex />
        <DragDropContext onDragEnd={onStepDragEnd}>
          <Droppable droppableId="steps">
            {(provided) => (
              <ul {...provided.droppableProps} ref={provided.innerRef}>
                {steps.map((step, index) => {
                  return (
                    <div key={step.libraryId}>
                      <Draggable
                        draggableId={String(step.libraryId)}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            className="w-full max-w-screen-lg"
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <BarMiddle />
                            <StepCard
                              href={step.library.link || ''}
                              src={step.library.img || ''}
                              memo={step.memo || ''}
                              title={step.library.title}
                              isOwner
                              onDeleteClick={() => deleteStep(index)}
                              onEditClick={() => openUpdateStepModal(index)}
                            />
                            <BarMiddle />
                          </div>
                        )}
                      </Draggable>
                    </div>
                  )
                })}
                {provided.placeholder}
              </ul>
            )}
          </Droppable>
        </DragDropContext>
        <BarMiddle />
        <Opener
          className="shadow-$rich"
          onClick={toggleShowForm}
          isOpen={isStepFormOpen}
          text={
            steps.length === 0
              ? '最初のステップを決めてみよう'
              : '次のステップを決めてみよう'
          }
        >
          <StepForm
            steps={steps}
            libs={libs}
            handleLibInputChange={handleLibInputChange}
            libTitleOptions={libTitleOptions}
            onSubmitStep={addStep}
            recLibs={recLibs}
            onGetCurrentRecLibs={getCurrentRecLibs}
            onCreateLibrary={(title, link) =>
              createLibrary(auth.token || '', title, link)
            }
            onSearchLibraries={searchLibraries}
          />
        </Opener>
        <BarMiddle />
        <BarVertex />
      </div>
      {/* goal section */}
      <div className="flex flex-col items-center w-full bg-$tint pb-8">
        <div className="max-w-screen-lg">
          <GoalForm
            register={(register as unknown) as UseFormRegister<FieldValues>}
          />
        </div>
      </div>

      <ButtonSmall
        text="保存"
        buttonRef={buttonRef}
        className="w-$max-content my-16"
        type="submit"
      />
    </form>
  )
}

type BasicInfoProps = {
  register: UseFormRegister<RoadmapFormSchema>
  control: Control<RoadmapFormSchema>
  tagOptions: SelectOption[]
  onTagInputChange: (keyword: string) => void
}
const BasicInfo = ({
  register,
  control,
  tagOptions,
  onTagInputChange
}: BasicInfoProps) => {
  const auth = useAuth()
  const router = useRouter()

  if (!auth.isLoggedIn) {
    pushSigninWithPrevUrl(router)
  }

  return (
    <div className="w-full mx-auto my-16">
      <RHFInput
        className="py-2 text-$t1 text-center w-full mb-6"
        name="title"
        register={(register as unknown) as UseFormRegister<FieldValues>}
        placeholder="タイトルを入力"
        required
      />
      {/* {errors.title && <span>This field is required</span>} */}
      <Controller
        name="tagSelect"
        control={control}
        defaultValue={''}
        rules={{ required: false }}
        render={({ field }) => (
          <SelectInput
            field={
              (field as unknown) as ControllerRenderProps<FieldValues, string>
            }
            options={tagOptions}
            placeholder={'関連するキーワードを入力してタグを作成'}
            onInputChange={onTagInputChange}
            multiple={true}
          />
        )}
      />
      <RHFTextarea
        className="w-full bg-$shade3 rounded-lg text-$t4 py-2 px-3 mt-6"
        name="description"
        register={(register as unknown) as UseFormRegister<FieldValues>}
        placeholder="概要を入力"
        cols={30}
        rows={8}
      />
    </div>
  )
}

export default RoadmapForm
