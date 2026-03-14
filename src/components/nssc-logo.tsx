import Image from 'next/image';

export function NsscLogo(props: React.SVGProps<SVGSVGElement> & { className?: string }) {
  return (
    <Image
      src="https://ik.imagekit.io/rgazxzsxr/National%20Skill%20Council%20new.jpg.jpeg"
      alt="National Skill Sector Council Logo"
      width={80}
      height={80}
      className={props.className}
    />
  );
}
