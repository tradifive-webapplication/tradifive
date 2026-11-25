import { MorphingText } from "@/components/ui/morphing-text";

const texts = [
  "Hello",
  "Morphing",
  "Text",
  "Animation",
  "React",
  "Component",
  "Smooth",
  "Transition",
  "Engaging",
];

export function MorphingTextDemo() {
  return (
    <div className="flex items-center justify-center min-h-[200px] w-full p-4">
      <MorphingText texts={texts} className="h-16 text-3xl font-bold" />
    </div>
  );
}

export default MorphingTextDemo;
