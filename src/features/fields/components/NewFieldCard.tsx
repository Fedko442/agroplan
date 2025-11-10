interface NewFieldCardProps {
  onClick: () => void;
}

export default function NewFieldCard({ onClick }: NewFieldCardProps) {
  return (
    <div
      className="flex-shrink-0 w-28 sm:w-32 md:w-36 lg:w-40 xl:w-44 2xl:w-48 3xl:w-52 p-2 sm:p-3 rounded-lg cursor-pointer transition-all border-2 border-dashed border-[#2D4A62] hover:border-[#E8F4FF] hover:bg-[#2D4A62] flex flex-col items-center justify-center"
      onClick={onClick}
    >
      <div className="text-[#8BA4B8] text-xl sm:text-2xl md:text-2xl lg:text-3xl xl:text-3xl 3xl:text-4xl mb-1">+</div>
      <div className="text-[#8BA4B8] text-xs sm:text-sm md:text-base lg:text-base xl:text-lg 3xl:text-xl text-center">
        Новое поле
      </div>
    </div>
  );
}
