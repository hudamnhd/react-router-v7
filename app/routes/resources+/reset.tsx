// app/routes/reset.js
import { Button } from "#app/components/ui/button";
import { json } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";

import cache from "#app/utils/cache-server.ts";

export const action = async () => {
  const headers = new Headers();
  headers.append("Clear-Site-Data", '"cache", "cookies", "storage"');
  return json({ success: true }, { headers });
};

export default function ResetPage() {
  const fetcher = useFetcher();

  const resetData = () => {
    // Kirim permintaan ke server untuk mengatur header Clear-Site-Data
    fetcher.submit(null, { method: "post" });
  };

  return (
    <div>
      <div className="container-wrapper">
        <div className="container flex flex-col items-start gap-1 py-8 md:py-10 lg:py-12">
          <h1 className="text-3xl font-bold leading-tight tracking-tighter md:text-4xl lg:leading-[1.1]">
            Reset All Data
          </h1>
          <p className="max-w-2xl text-lg font-light text-foreground mb-2">
            This will delete all data that has been saved.
          </p>
          <pre className="text-sm mb-2">
            {JSON.stringify(fetcher.data, null, 2)}
          </pre>
          <div className="flex items-center gap-x-2">
            <Button
              disabled={fetcher.state !== "idle"}
              onClick={resetData}
              className="reset-button"
              variant="destructive"
            >
              {fetcher.state !== "idle" ? (
                <strong>Resetting data...</strong>
              ) : (
                "Reset All Data"
              )}
            </Button>

            <Button onClick={resetData} className="reset-button">
              Go Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
