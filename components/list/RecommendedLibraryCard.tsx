import Link from 'next/link'
import { shortenText, getSystemColorFromPercentage } from '~/utils/utility'

// 参考: [JavaScriptでURLからOGP取得する - Qiita](https://qiita.com/ksyunnnn/items/bfe2b9c568e97bb6b494)
type RecommendedLibraryCardProps = {
  src: string
  title: string
  maxTitleLength: number
  maxLinkLength: number
  href: string
  percent: number
}
const RecommendedLibraryCard = ({
  src,
  title,
  maxTitleLength,
  maxLinkLength,
  href,
  percent
}: RecommendedLibraryCardProps) => {
  // FIXME: OGP画像のurlとってくる処理をserver側でやる(CORSのため)
  // let src =
  //   'https://pbs.twimg.com/profile_images/1377089205516431361/UgFbDgAH_400x400.jpg' // FIXME: いい画像に置き換える。
  // fetch(href)
  //   .then((res) => res.text())
  //   .then((text) => {
  //     const el = new DOMParser().parseFromString(text, 'text/html')
  //     const headEls = el.head.children
  //     const ogpImage = Array.from(headEls).map((v) => {
  //       if (v.getAttribute('property') !== 'og:image') return
  //       return v.getAttribute('content')
  //     })[0]
  //     if (!ogpImage) return
  //     src = ogpImage
  //   })
  //   .catch()

  return (
    <div className="flex items-start flex-col bg-$white rounded-3xl shadow-$rich p-6">
      <div
        className={`flex items-center justify-center h-24 w-16 rounded-md overflow-hidden mr-8`}
      >
        <img
          className={`object-contain h-full w-full block`}
          src={src || '/no-source.png'}
        />
      </div>

      <div className={`flex-grow`}>
        <p className="text-$t3 text-$primary mb-1">
          {shortenText(title, maxTitleLength)}
        </p>
        <Link href={href}>
          <p className={`text-$T6 text-$indigo cursor-pointer`}>
            {shortenText(decodeURI(href), maxLinkLength)}
          </p>
        </Link>
      </div>

      <div className={`flex flex-col items-center`}>
        <p className={`text-$shade1 text-$t6`}>{`おすすめ度`}</p>
        <p className={`text-${getSystemColorFromPercentage(percent)}`}>
          <span className={`text-$T1`}>{percent}</span>
          <span className={`text-$T4`}>{`%`}</span>
        </p>
      </div>
    </div>
  )
}

export default RecommendedLibraryCard
