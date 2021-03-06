import useAspidaSWR from '@aspida/swr'
import { useRouter } from 'next/router'
import NavictChan from '~/components/NavictChan'
import RoadmapForm, {
  RoadmapFormSchema,
  StepWithLib
} from '~/components/roadmaps/RoadmapForm'
import { apiClient } from '~/utils/apiClient'
import { Library, Roadmap } from '$prisma/client'
import { useAuth } from '~/contexts/AuthContext'
import { createLibrary } from '~/utils/libraries'
import { RoadmapUpdateBody } from '~/server/types'
import { createReqSteps, createReqTags, updateRoadmap } from '~/utils/roadmaps'
import Layout from '~/components/Layout'
import { SubmitHandler } from 'react-hook-form'
import { SelectOption } from '~/components/parts/SelectInput'
import { useRef, useState } from 'react'
import { HEADER_BTN_TYPES } from '~/components/Header'
import type { DropResult } from 'react-beautiful-dnd'

const EditRoadmap = () => {
  const router = useRouter()
  const { roadmapId } = router.query
  const roadmapIdAsNumber =
    typeof roadmapId === 'string' ? +roadmapId : undefined //TODO:適当なurlとか、他の人のロードマップとかのときを処理する
  if (!roadmapIdAsNumber) return <div>failed to load...</div>
  const { data: roadmap, error: userError } = useAspidaSWR(
    apiClient.roadmaps._roadmapId(roadmapIdAsNumber)
  )

  const auth = useAuth()
  // for saving on nav button click
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [steps, setSteps] = useState<StepWithLib[]>([] as StepWithLib[])
  const onCreateLibrary = (title: Library['title'], link?: Library['link']) =>
    createLibrary(auth.token || '', title, link)
  const onUpdateRoadmap = (id: Roadmap['id'], data: RoadmapUpdateBody) =>
    updateRoadmap(auth.token || '', id, data)

  if (userError) return <div>failed to load</div>
  if (!roadmap) return <NavictChan text="LOADING..." />

  const handleStepDragEnd = (result: DropResult) => {
    if (!result.destination) return
    const items = [...steps]
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)
    setSteps(items)
  }

  const fireSubmit = () => {
    buttonRef?.current?.click()
  }
  // on submit roadmap form
  const onSubmit: SubmitHandler<RoadmapFormSchema> = async (data) => {
    try {
      if (!auth.isLoggedIn) return
      const changedTitle = roadmap.title !== data.title
      const changedDescription = roadmap.description !== data.description
      const changedGoal = roadmap.goal !== data.goal
      const updateBody: RoadmapUpdateBody = {
        userId: auth.user?.id,
        title: changedTitle ? data.title : undefined,
        tags: createReqTags(data.tagSelect as SelectOption[]),
        description: changedDescription ? data.description : undefined,
        steps: createReqSteps(steps),
        goal: changedGoal ? data.goal : undefined
      }
      await onUpdateRoadmap(roadmap.id, updateBody)
      router.push(`/roadmaps/${roadmap.id}`)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <Layout
      headerType={HEADER_BTN_TYPES.SAVE}
      onHeaderSaveBtnClick={fireSubmit}
    >
      <RoadmapForm
        buttonRef={buttonRef}
        defaultRoadmap={roadmap}
        steps={steps}
        setSteps={setSteps}
        onCreateLibrary={onCreateLibrary}
        onSubmitForm={onSubmit}
        onStepDragEnd={handleStepDragEnd}
      />
    </Layout>
  )
}

export default EditRoadmap
