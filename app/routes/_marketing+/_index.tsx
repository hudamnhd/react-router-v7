import { Button } from "#app/components/ui/button";
import { ExternalLink, CheckCircle } from "lucide-react";
import { muslimLinks, toolsLinks } from "#app/constants/nav-link";
import { useNavigate } from "@remix-run/react";

export default function Example() {
  const data = [...muslimLinks, ...toolsLinks];
  const navigate = useNavigate();
  return (
    <div className="px-4 border-x h-[calc(100vh-56px)]">
      <div className="text-center py-3">
        <h1 className="text-center text-3xl font-bold leading-tight tracking-tighter md:text-4xl lg:leading-[1.1]">
          Apps
        </h1>
        <p className="text-muted-foreground mt-1">
          Here's a list of apps ready to use!
        </p>
      </div>
      <div className="faded-bottom no-scrollbar grid gap-4 overflow-auto pb-16 pt-4 md:grid-cols-2 lg:grid-cols-3">
        {data.map((action, actionIdx) => (
          <div
            key={actionIdx}
            onClick={() => navigate(action.href)}
            className="rounded-lg border p-4 hover:shadow-md bg-gradient-to-tr from-background via-background to-accent"
          >
            <div className="mb-8 flex items-center justify-between">
              <div className="flex size-10 items-center justify-center rounded-lg bg-muted p-2">
                <action.icon className="h-6 w-6" aria-hidden="true" />
              </div>
              <Button
                onClick={() => navigate(action.href)}
                variant="outline"
                size="icon"
              >
                <ExternalLink />
              </Button>
            </div>
            <div>
              <h2 className="mb-1 font-semibold">{action.title}</h2>
              <p className="line-clamp-2 text-gray-500">{action.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
