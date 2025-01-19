import React from "react";

const preBismillah = {
  text: {
    ar: "\ufeff\u0628\u0650\u0633\u0652\u0645\u0650\u0020\u0627\u0644\u0644\u0651\u064e\u0647\u0650\u0020\u0627\u0644\u0631\u0651\u064e\u062d\u0652\u0645\u064e\u0670\u0646\u0650\u0020\u0627\u0644\u0631\u0651\u064e\u062d\u0650\u064a\u0645\u0650",
    read: "Bismillāhir-raḥmānir-raḥīm(i). ",
  },
  translation: {
    id: "Dengan nama Allah Yang Maha Pengasih lagi Maha Penyayang.",
  },
  tafsir: {
    text: "Dengan nama Allah Yang Maha Pengasih lagi Maha Penyayang.",
  },
};
const Wallpaper = () => {
  return (
    <div className="prose max-w-none bg-[#e0e2ea] h-screen w-screen flex flex-col items-center justify-center">
      <div className="text-8xl font-lpmq-2">{preBismillah.text.ar}</div>
      <div className="text-3xl mt-10">{preBismillah.translation.id}</div>
    </div>
  );
};

export default Wallpaper;
