import { TbHandMove } from "react-icons/tb";

const SwipeHint = ({ isFirstGame }: { isFirstGame: boolean }) => {
  return (
    isFirstGame && (
      <div className="flex flex-col gap-2 items-center justify-center fixed inset-0  z-50 swipe-hint">
        <TbHandMove className="swipe-icon" />

        <span className="flex gap-1 text-slate-400 w-1/2 text-sm">
          <span className="border-2 border-slate-600 rounded-md shadow-md bg-slate-700 w-1/4 text-center animate-[bounce_1s_ease-in-out_infinite]">
            ↑
          </span>
          <span className="border-2 border-slate-600 rounded-md shadow-md bg-slate-700 w-1/4 text-center animate-[bounce_2s_ease-in-out_infinite]">
            ←
          </span>
          <span className="border-2 border-slate-600 rounded-md shadow-md bg-slate-700 w-1/4 text-center animate-[bounce_3s_ease-in-out_infinite]">
            ↓
          </span>
          <span className="border-2 border-slate-600 rounded-md shadow-md bg-slate-700 w-1/4 text-center animate-[bounce_4s_ease-in-out_infinite]">
            →
          </span>
        </span>

        <div className="flex flex-col gap-1 w-1/2">
          <span className="flex gap-1 text-slate-400 text-sm justify-center">
            <span className="border-2 border-slate-600 rounded-md shadow-md bg-slate-700 font-sans w-1/4 text-center animate-[bounce_1s_ease-in-out_infinite]">
              W
            </span>
          </span>

          <span className="flex gap-1 text-slate-400 text-sm justify-center">
            <span className="border-2 border-slate-600 rounded-md shadow-md bg-slate-700 font-sans w-1/4 text-center animate-[bounce_2s_ease-in-out_infinite]">
              A
            </span>
            <span className="border-2 border-slate-600 rounded-md shadow-md bg-slate-700 font-sans w-1/4 text-center animate-[bounce_3s_ease-in-out_infinite]">
              S
            </span>
            <span className="border-2 border-slate-600 rounded-md shadow-md bg-slate-700 font-sans w-1/4 text-center animate-[bounce_4s_ease-in-out_infinite]">
              D
            </span>
          </span>
        </div>
      </div>
    )
  );
};

export default SwipeHint;
