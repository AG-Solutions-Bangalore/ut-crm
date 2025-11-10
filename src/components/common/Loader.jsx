import React from 'react';
import { Loader2 } from 'lucide-react';

const Loader = ({ msg = "Loading..." }) => {
  return (
    <div className="flex flex-col items-center justify-center w-full h-[300px] bg-white">
      <div className="flex flex-col items-center space-y-4  ">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
        <p className="text-gray-800 text-lg font-medium ">
          {msg}
        </p>
      </div>
    </div>
  );
};

export default Loader;
