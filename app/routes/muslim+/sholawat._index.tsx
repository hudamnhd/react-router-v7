import data from "#/app/constants/sholawat";

export default function Sholawat() {
  const sholawat = data;

  return (
    <div className="prose dark:prose-invert max-w-4xl mx-auto border-x">
      <h1 className="text-center text-3xl font-bold leading-tight tracking-tighter md:text-4xl lg:leading-[1.1] capitalize py-4">
        Sholawat
      </h1>

      {sholawat.map((ayat, index) => {
        return (
          <div
            key={index}
            className="group relative px-4 py-4 sm:py-4 sm:px-5 rounded-md border-t"
          >
            <h2 className="font-bold mb-2 prose-lg">{ayat.nama}</h2>
            <div className="w-full text-right flex gap-x-2.5 items-start justify-end">
              <p className="relative mt-2 font-lpmq text-right text-primary">
                {ayat.arab}
              </p>
            </div>
            <div className="">
              <div
                className="latin-text mt-3 prose max-w-none text-muted-foreground"
                dangerouslySetInnerHTML={{
                  __html: ayat.latin,
                }}
              />
              <div
                className="translation-text mt-3 prose max-w-none text-accent-foreground italic"
                dangerouslySetInnerHTML={{
                  __html: ayat.arti,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
