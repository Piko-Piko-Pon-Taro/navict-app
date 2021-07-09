import Image from 'next/image'

type CrossProp = {
  onClick?: () => void
}
const Cross = ({ onClick }: CrossProp) => {
  return (
    <Image
      src={`/cross.svg`}
      width={20}
      height={20}
      onClick={onClick}
      className={`cursor-pointer`}
    />
  )
}

export default Cross
