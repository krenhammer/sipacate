import { FC } from "react";
import { Thread } from "../thread";
import { FileReadToolUI } from "../tools/FileReadToolUi";

export const Messages: FC = () => {
  return (
    <div className="w-full h-full">
      <FileReadToolUI />
      <Thread />
    </div>
  );
}; 