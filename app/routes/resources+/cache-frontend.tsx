import { validateForm } from "#app/utils/validation-data.ts";
import { Spinner } from "#app/components/ui/spinner-circle";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { ActionFunctionArgs, json } from "@remix-run/server-runtime";
import { useCallback } from "react";
import { Button } from "#app/components/ui/button";
import { Input } from "#app/components/ui/input";
import { z } from "zod";
import cache from "#app/utils/cache-server.ts";
import { Trash2, Repeat } from "lucide-react";

const FormActionSchema = z.discriminatedUnion("intent", [
  z.object({
    intent: z.literal("delete-cache"),
    key: z.string().min(1),
  }),
  z.object({
    intent: z.literal("delete-all-cache"),
  }),
]);

export async function action({ request }: ActionFunctionArgs) {
  const {
    success,
    data: submission,
    error,
  } = await validateForm(request, FormActionSchema);

  if (success) {
    switch (submission.intent) {
      case "delete-cache": {
        const response = cache.delete(submission.key);
        return json({ success, response }, { status: 201 });
      }
      case "delete-all-cache": {
        const response = cache.clear();
        return json({ success, response }, { status: 201 });
      }
    }
  } else {
    return json({ success, error });
  }
}

export async function loader() {
  const all = cache.getAll();
  const data = Object.entries(all).map(([key, value]) => ({ key, value }));
  return json({ data });
}

function useDeleteItem() {
  const fetcher = useFetcher();
  const submit = useCallback(
    (key: string) => {
      const body = new FormData();
      body.append("key", key);
      body.append("intent", "delete-cache");
      fetcher.submit(body, {
        method: "POST",
        action: "/resources/cache-frontend",
      });
    },
    [fetcher],
  );
  return submit;
}

export default function Example() {
  const { data } = useLoaderData<typeof loader>();

  const fetcher = useFetcher();
  return (
    <div className="space-y-3 mt-5 px-4">
      <div className="flex flex-col">
        <h1 className="font-bold mb-2">Lru Cache</h1>

        <div className="mb-4 flex items-center gap-x-2">
          <Button
            onPress={() =>
              fetcher.submit(
                { intent: "delete-all-cache" },
                {
                  method: "POST",
                  action: "/resources/cache-frontend",
                },
              )
            }
            type="button"
            variant="destructive"
          >
            {fetcher.state !== "idle" ? (
              <>
                <Spinner className="size-5" />
                Loading
              </>
            ) : (
              <>
                <Trash2 className="size-5" />
                <span>Delete All Cache</span>
              </>
            )}
          </Button>
          <Button
            onClick={() => fetcher.load("/resources/cache-frontend")}
            type="button"
          >
            {fetcher.state !== "idle" ? (
              <>
                <Spinner className="size-5" />
                Loading
              </>
            ) : (
              <>
                <Repeat className="size-5" />
                <span>Refresh Cache</span>
              </>
            )}
          </Button>
        </div>
        <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
            <div className="shadow overflow-hidden border-b  sm:rounded-lg">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                    >
                      Key + Action
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                    >
                      Value
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.length === 0 ? (
                    <tr className="bg-white">
                      <td
                        colSpan={3}
                        className="px-6 py-4 text-sm text-muted-foreground text-center"
                      >
                        No data
                      </td>
                    </tr>
                  ) : (
                    data.map((d, index) => <CacheView d={d} key={index} />)
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CacheView({ d }: { d: any }) {
  const fetcher = useFetcher({ key: d.key });

  const submitData = useDeleteItem();

  return (
    <tr key={d.key} className="bg-background">
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium align-top">
        <div className="flex items-center">
          <Input value={d.key} readonly />
          <Button
            onClick={() => submitData(d.key)}
            type="button"
            variant="destructive"
            className="ml-3"
          >
            {fetcher.state !== "idle" ? (
              <span>
                <Spinner className="size-5" />
              </span>
            ) : (
              <span>
                <Trash2 className="size-5" />
              </span>
            )}
          </Button>
        </div>
      </td>
      <td className="px-6 py-4 text-sm text-muted-foreground ">
        <JsonPrettyPrint data={d.value} />
      </td>
    </tr>
  );
}

export const JsonPrettyPrint = ({ data }) => {
  const renderJson = (obj, depth = 0) => {
    return Object.entries(obj).map(([key, value]) => {
      // Cek apakah value adalah string JSON yang bisa di-parse
      let parsedValue = value;
      if (typeof value === "string") {
        try {
          parsedValue = JSON.parse(value);
        } catch (e) {
          // Jika gagal parse, biarkan value tetap dalam bentuk string aslinya
        }
      }

      return (
        <div key={key} style={{ paddingLeft: `${depth * 20}px` }}>
          <strong>{key}:</strong>{" "}
          {typeof parsedValue === "object" && parsedValue !== null ? (
            <div>{renderJson(parsedValue, depth + 1)}</div>
          ) : (
            <span>{JSON.stringify(parsedValue)}</span>
          )}
        </div>
      );
    });
  };

  return (
    <details
      className="my-1 group [&_summary::-webkit-details-marker]:hidden w-[50vw]"
      open
    >
      <summary className="flex cursor-pointer items-center gap-1.5 rounded-sm border w-fit py-1 px-2 mb-1">
        <span className="font-medium text-xs">DEBUG</span>
      </summary>
      <pre className="text-sm hyphens-auto break-word whitespace-pre-wrap break-all text-md h-[30vh] overflow-y-auto  border p-4 rounded-l max-w-[50vw]">
        {renderJson(data)}
      </pre>
    </details>
  );
};
