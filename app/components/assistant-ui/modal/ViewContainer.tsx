import { FC, useState, useEffect, useRef } from "react";
import { ModalViewType } from "./types";
import { Messages } from "./Messages";
import { ModelSelection } from "./ModelSelection";

interface ViewContainerProps {
  activeView: ModalViewType;
}

export const ViewContainer: FC<ViewContainerProps> = ({ activeView }) => {


  switch (activeView) {
    case 'messages':
      // If no project folder is selected, redirect to project selection
      return <Messages />
      // Settings is handled separately by navigating to the settings page
      return null;
    case 'model':
      return <ModelSelection />;
    default:
      return <Messages /> ;
  }
}; 