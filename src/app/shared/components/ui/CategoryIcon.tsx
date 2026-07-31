// app/components/icons/CategoryIcon.tsx - THE NEW INTELLIGENT ICON COMPONENT

import Image from "next/image";

interface CategoryIconProps {
  slug: string; // Hum pehchan ke liye 'slug' istemal karenge
  categoryName: string; // Yeh 'alt' text ke liye zaroori hai
}

export default function CategoryIcon({
  slug,
  categoryName,
}: CategoryIconProps) {
  // Image ka path category ke slug se banayenge
  // Hum assume kar rahe hain ke aap SVG images istemal karenge
  const iconPath = `/icons/categories/${slug}.svg`;

  return (
    <div className="relative h-6 w-6">
      <Image
        src={iconPath}
        alt={`${categoryName} category icon`}
        fill
        sizes="24px"
        // Yeh line SVG images ko CSS ke zariye color karne ki ijazat degi (agar zaroorat pade)
        className="object-contain"
        // Agar image load na ho to yeh error handle karega (optional, lekin acha hai)
        onError={(e) => {
          e.currentTarget.style.display = "none";
        }}
      />
    </div>
  );
}
