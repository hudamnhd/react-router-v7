import { data } from "#/app/constants/tahlil";

export default function Route() {
  const tahlil = data;

  return (
    <div className="pb-5">
      <h1 className="text-center text-3xl font-bold leading-tight tracking-tighter md:text-4xl lg:leading-[1.1] capitalize mb-4">
        Tahlil
      </h1>

      {tahlil.map((ayat, index) => {
        const arabicContent = ayat?.arabic;
        const translateContent = ayat?.translation;
        return (
          <div
            key={index}
            style={{ animationDelay: `${index * 0.1}s` }}
            className={`animate-slide-top [animation-fill-mode:backwards] group relative py-5 px-3 sm:px-5 hover:bg-accent/70 rounded-md `}
          >
            <div>
              <div className="space-y-1 mb-2">
                <h4 className="font-medium leading-none">{ayat.title}</h4>
              </div>
            </div>
            <div className="w-full text-right flex gap-x-2.5 items-start justify-end">
              <p
                className="relative mt-2 font-lpmq text-right text-primary"
                dangerouslySetInnerHTML={{
                  __html: arabicContent,
                }}
              />
            </div>
            <div className="mt-3 space-y-3">
              <div
                className="translation-text prose text-muted-foreground max-w-none"
                dangerouslySetInnerHTML={{
                  __html: translateContent,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
