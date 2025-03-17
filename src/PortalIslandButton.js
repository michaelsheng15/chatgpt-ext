import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import IslandButton from "./IslandButton";

function PortalIslandButton(props) {
  const [mountNode, setMountNode] = useState(null);

  useEffect(() => {
    // Set up a more robust mechanism to find the mount node
    const findAndSetMountNode = () => {
      const el = document.getElementById("my-optimize-floating-block");
      if (el && el !== mountNode) {
        console.log("Found mount node for PortalIslandButton");
        setMountNode(el);
      }
    };

    // Try to find the mount node immediately
    findAndSetMountNode();

    // Also set up an interval to keep checking until we find it
    const intervalId = setInterval(findAndSetMountNode, 500);

    // Clean up the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, [mountNode]);

  // For debugging
  useEffect(() => {
    console.log("PortalIslandButton updated with isSidebarVisible:", props.isSidebarVisible);
  }, [props.isSidebarVisible]);

  // If we haven't found the mount node yet, render nothing
  if (!mountNode) {
    console.log("Mount node not found yet for PortalIslandButton");
    return null;
  }

  // Portal the IslandButton into the mount node
  return ReactDOM.createPortal(
    <IslandButton {...props} />,
    mountNode
  );
}

export default PortalIslandButton;