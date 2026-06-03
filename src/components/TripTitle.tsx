import { type KeyboardEvent } from "react";
import { Pencil } from "lucide-react";

interface TripTitleProps {
  title: string;
  isEditing: boolean;
  inputValue: string;
  onInputChange: (value: string) => void;
  onStartEdit: () => void;
  onSave: () => void;
  t: (key: string) => string;
  slug?: string;
  shortId: string;
}

export default function TripTitle({
  title,
  isEditing,
  inputValue,
  onInputChange,
  onStartEdit,
  onSave,
  t,
  slug,
  shortId,
}: TripTitleProps) {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter") onSave();
  };

  return (
    <div className="w-full">
      {isEditing ? (
        <div className="flex items-center mb-1">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => onInputChange(e.target.value)}
            onBlur={onSave}
            onKeyDown={handleKeyDown}
            autoFocus
            className="font-display font-bold text-3xl text-ink bg-white px-2 py-1 -ml-2 rounded-xl outline-none ring-2 ring-pastel-pink/50 w-full"
          />
        </div>
      ) : (
        <div
          className="flex items-center gap-2 mb-1 group cursor-pointer w-fit max-w-full"
          onClick={onStartEdit}
          title={t("editTripName")}
        >
          <h1 className="font-display font-bold text-3xl text-ink truncate">{title}</h1>
          <button className="text-ink-light opacity-50 group-hover:opacity-100 transition-opacity p-1 bg-pastel-cream rounded-full hover:bg-pastel-yellow/30 shrink-0">
            <Pencil className="w-4 h-4" />
          </button>
        </div>
      )}
      <p className="text-ink-light font-sans text-sm font-medium">
        {t("friendshipId")}{" "}
        <span className="font-mono text-xs opacity-70 bg-ink-light/10 px-2 py-0.5 rounded-full select-all">
          {slug || shortId}
        </span>
      </p>
    </div>
  );
}
