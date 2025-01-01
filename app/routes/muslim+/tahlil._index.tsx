import { data } from "#/app/constants/tahlil";

export default function Route() {
  const tahlil = data;

  return (
    <div className="prose dark:prose-invert max-w-4xl mx-auto border-x">
      <h1 className="text-center text-3xl font-bold leading-tight tracking-tighter md:text-4xl lg:leading-[1.1] capitalize py-4">
        Tahlil
      </h1>

      {tahlil.map((ayat, index) => {
        const arabicContent = ayat?.arabic;
        const translateContent = ayat?.translation;
        return (
          <div
            key={index}
            className="group relative px-4 py-4 sm:py-4 sm:px-5 rounded-md border-t"
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
