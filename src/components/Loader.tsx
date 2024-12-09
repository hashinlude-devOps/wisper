"use client";

import { Loader as LoaderIcon } from "lucide-react";
import React from "react";

const Loader = () => {
  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black-3 bg-opacity-50 flex justify-center items-center z-50">
      <LoaderIcon className="animate-spin text-white-1" size={40} />
    </div>
  );
};

export default Loader;
