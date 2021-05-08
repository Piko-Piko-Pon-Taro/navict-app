import Image from 'next/image'
import { useState } from 'react'
import StepCard from './StepCard'

type StepCardWithCheckProps = {
  src: string
  title: string
  href: string
  memo: string
  initialIsChecked: boolean
  onDeleteClick: () => void
  onCheckClick: (bool: boolean) => void
}
const StepCardWithCheck = ({
  src,
  title,
  href,
  memo,
  initialIsChecked,
  onDeleteClick,
  onCheckClick
}: StepCardWithCheckProps) => {
  const [isChecked, setIsChecked] = useState<boolean>(initialIsChecked)
  const handleCheckClick = () => {
    onCheckClick(!isChecked)
    setIsChecked(!isChecked)
  }

  let checkIcon
  if (isChecked) {
    checkIcon = (
      <Image
        src={`/check-fill.svg`}
        width={46}
        height={46}
        onClick={handleCheckClick}
        className={`cursor-pointer`}
      />
    )
  } else {
    checkIcon = (
      <Image
        src={`/check-outline.svg`}
        width={46}
        height={46}
        onClick={handleCheckClick}
        className={`cursor-pointer`}
      />
    )
  }
  return (
    <div className={`relative`}>
      <div
        className={`absolute top-1/2 -left-20`}
        style={{
          transform: 'translateY(-50%)'
        }}
      >
        {checkIcon}
      </div>
      <StepCard
        src={src}
        title={title}
        href={href}
        memo={memo}
        canDelete={true}
        onDeleteClick={onDeleteClick}
      />
    </div>
  )
}

export default StepCardWithCheck
