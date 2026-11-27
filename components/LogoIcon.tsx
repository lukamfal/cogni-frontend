import Image from 'next/image'

/** CogniMente mark: beige brain-and-bolt on the brand green tile. */
export default function LogoIcon() {
  return (
    <div className="logo-icon" aria-hidden="true">
      <Image src="/logo-mark-beige.png" alt="" width={64} height={64} priority />
    </div>
  )
}
