import React from "react";

const Command = () => {
  return (
    <>
      <div
        className="fixed inset-0 z-10 overflow-y-auto p-4 sm:p-6 md:p-20"
        role="dialog"
        aria-modal="true"
      >
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-25 transition-opacity"
          aria-hidden="true"
        />
      </div>
    </>
  );
};

export default Command;
