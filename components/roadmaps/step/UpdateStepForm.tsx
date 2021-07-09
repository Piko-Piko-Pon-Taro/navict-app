import React, { useEffect } from 'react'
import {
  Controller,
  ControllerRenderProps,
  FieldValues,
  SubmitHandler,
  useForm,
  UseFormRegister
} from 'react-hook-form'
import { Library } from '$prisma/client'
import ButtonSmall from '~/components/button/ButtonSmall'
import RHFInput from '~/components/parts/RHFInput'
import { LibraryCreateBody, LibraryInfo, StepCreateBody } from '~/server/types'
import SelectInput, { SelectOption } from '~/components/parts/SelectInput'
import RHFTextarea from '~/components/parts/RHFTextarea'
import { StepWithLib } from '../RoadmapForm'

export type LibraryForm = {
  titleSelect: SelectOption
  link?: LibraryCreateBody['link']
  memo?: StepCreateBody['memo']
}

type UpdateStepFormProps = {
  step: StepWithLib
  libTitleOptions: SelectOption[]
  libs: LibraryInfo[]
  handleLibInputChange: (keyword: string) => void
  onSearchLibraries: (keyword: string) => Promise<Library[]>
  onCreateLibrary: (
    title: string,
    link?: string | null | undefined
  ) => Promise<Library>
  onSubmitStep: (step: StepWithLib) => void
  onClickCloseButton: () => void
}

const UpdateStepForm = ({
  step,
  libTitleOptions,
  libs,
  handleLibInputChange,
  onSearchLibraries,
  onCreateLibrary,
  onSubmitStep,
  onClickCloseButton
}: UpdateStepFormProps) => {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors }
  } = useForm<LibraryForm>()

  useEffect(() => {
    setValue('link', step.library.link)
    setValue('titleSelect', {
      index: step.libraryId,
      label: step.library.title,
      value: step.library.title
    })
    setValue('memo', step.memo)
  }, [])

  const onSubmit: SubmitHandler<LibraryForm> = async (data) => {
    let library: Library | undefined = step.library
    let createLib = false

    try {
      // user changed library
      if (data.titleSelect.index !== step.libraryId) {
        library = libs.find((lib) => lib.id === data.titleSelect.index)
      }
      createLib = library?.link !== data.link
      if (createLib) {
        library = await onCreateLibrary(data.titleSelect.value, data.link)
      }
      if (!library) throw Error('failed to get library')
      const libraryId = library.id
      const newStep: StepWithLib = {
        libraryId,
        library: library,
        memo: data.memo || null,
        nextStepId: null,
        isDone: false
      }
      onSubmitStep(newStep)
    } catch (err) {
      // unique constraint error of prisma (title + link must be unique)
      if (err.response.data.code === 'P2002') {
        try {
          const existingLibs = await onSearchLibraries(data.titleSelect.value)
          const lib = existingLibs.find(
            (exitstingLib) => exitstingLib.link === data.link
          ) as Library
          const step: StepWithLib = {
            libraryId: lib?.id,
            library: lib,
            memo: data.memo || null,
            nextStepId: null,
            isDone: false
          }
          onSubmitStep(step)
        } catch (err) {
          console.error(err)
        }
      }
    }
  }

  const handleSelectLibTitleOption = (value: SelectOption | SelectOption[]) => {
    const v = value as SelectOption
    const library = libs.find((lib) => lib.id === v.index)
    setValue('link', library?.link || null)
  }

  return (
    <div className="w-full">
      <div className="flex flex-col w-full">
        <p className="text-$t4 text-$shade1">教材</p>
        <Controller
          name="titleSelect"
          control={control}
          defaultValue={''}
          rules={{ required: true }}
          render={({ field }) => (
            <SelectInput
              field={
                (field as unknown) as ControllerRenderProps<FieldValues, string>
              }
              options={libTitleOptions}
              placeholder={'本の名前やサイトの名前を入力してみよう'}
              multiple={false}
              onInputChange={handleLibInputChange}
              onSelectOption={handleSelectLibTitleOption}
            />
          )}
        />
      </div>
      <RHFInput
        className="p-2 text-left w-full my-6 bg-$shade3"
        register={(register as unknown) as UseFormRegister<FieldValues>}
        name="link"
        placeholder="https://navict-app.vercel.app/"
      />
      <p className="text-$t4 text-$shade1">メモ</p>

      <RHFTextarea
        className="p-4 w-full mb-6 bg-$shade3"
        register={(register as unknown) as UseFormRegister<FieldValues>}
        name="memo"
        placeholder="メモを追加しよう"
        rows={8}
        cols={20}
      />
      <div className="flex justify-evenly">
        {errors.titleSelect ? (
          <ButtonSmall
            disabled={true}
            text="本やサイトの名前を追加して下さい"
          />
        ) : (
          <ButtonSmall onClick={handleSubmit(onSubmit)} text="保存" />
        )}
        <ButtonSmall
          text="閉じる"
          className="bg-$accent2"
          onClick={onClickCloseButton}
        />
      </div>
    </div>
  )
}

export default UpdateStepForm
