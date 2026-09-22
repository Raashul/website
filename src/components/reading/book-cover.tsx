import Image from "next/image";

const PLACEHOLDER = "/covers/placeholder.svg";

interface BookCoverProps {
  cover: string | null;
  title: string;
  sizes: string;
  priority?: boolean;
}

export function BookCover({ cover, title, sizes, priority }: BookCoverProps) {
  return (
    <div className="relative aspect-[2/3] w-full overflow-hidden rounded-md bg-[var(--surface)] ring-1 ring-[var(--border)]">
      <Image
        src={cover || PLACEHOLDER}
        alt={`Cover of ${title}`}
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover"
      />
    </div>
  );
}
