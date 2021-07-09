import Image from 'next/image'

type ThreeDotsProp = {
  onClick?: () => void
  width?: number
  height?: number
}
const ThreeDots = ({ onClick, width = 16, height = 20 }: ThreeDotsProp) => {
  return (
    <Image
      src={`/three-dots.svg`}
      width={width}
      height={height}
      onClick={onClick}
      className={`cursor-pointer`}
    />
  )
}

export default ThreeDots
