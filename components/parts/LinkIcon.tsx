import Image from 'next/image'

type LinkIconProps = {
  type: 'twitter' | 'github' | 'web'
  text?: string
  width: number
  height: number
}
const iconLinks = {
  twitter: '/brandIcon/twitterIconGrey.svg',
  github: '/brandIcon/githubIcon.svg',
  web: '/icon/webIconGrey.svg'
}
const LinkIcon = ({ type, text, width, height }: LinkIconProps) => {
  return (
    <div className="flex flex-col justify-center items-center">
      <Image
        className="text-$primary2"
        src={iconLinks[type]}
        width={width}
        height={height}
      />
      <p className="text-$primary2 text-$t6">{text}</p>
    </div>
  )
}

export default LinkIcon
