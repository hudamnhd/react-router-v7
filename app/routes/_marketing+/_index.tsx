import { Button } from "#app/components/ui/button";
import { ExternalLink, CheckCircle } from "lucide-react";
import { muslimLinks, toolsLinks } from "#app/constants/nav-link";
import { useNavigate, Link } from "@remix-run/react";

export default function Example() {
  const data = [...muslimLinks, ...toolsLinks];
  const navigate = useNavigate();
  return (
    <div className="px-4 border-x h-[calc(100vh-60px)]">
      <div className="text-center py-3">
        <h1 className="text-center text-3xl font-bold leading-tight tracking-tighter md:text-4xl lg:leading-[1.1]">
          Apps
        </h1>
        <p className="text-muted-foreground mt-1">
          Here's a list of apps ready to use!
        </p>
      </div>

      <ul role="list" className="sm:hidden grid grid-cols-1 gap-3 pb-4">
        {data.map((action, actionIdx) => (
          <li key={actionIdx} className="col-span-1 flex shadow-sm rounded-md">
            <div className="flex-shrink-0 flex items-center justify-center w-16 text-sm font-medium rounded-l-md bg-gradient-to-br from-emerald-500/10 to-teal-500/10 dark:from-emerald-500/20 dark:to-teal-500/20">
              <action.icon className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="flex-1 flex items-center justify-between border-t border-r border-b  rounded-r-md truncate">
              <div className="flex-1 px-4 py-2 text-sm truncate">
                <Link
                  to={action.href}
                  className="font-semibold hover:text-muted-foreground cursor-pointer"
                >
                  {action.title}
                </Link>
                <p className="text-muted-foreground line-clamp-1">
                  {action.description}
                </p>
              </div>
              <div className="flex-shrink-0 pr-2">
                <Button
                  onPress={() => navigate(action.href)}
                  type="button"
                  size="icon"
                  variant="outline"
                >
                  <ExternalLink className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <div className="sm:grid hidden faded-bottom no-scrollbar gap-4 overflow-auto pb-16 pt-4 md:grid-cols-2 lg:grid-cols-3">
        {data.map((action, actionIdx) => (
          <div
            key={actionIdx}
            onClick={() => navigate(action.href)}
            className="rounded-lg border p-4 hover:shadow-md bg-gradient-to-br from-background via-background to-accent"
          >
            <div className="mb-8 flex items-center justify-between">
              <div className="flex size-10 items-center justify-center rounded-lg bg-gradient-to-br from-muted via-primary/5 to-muted p-2">
                <action.icon className="h-6 w-6" aria-hidden="true" />
              </div>
              <Button
                onPress={() => navigate(action.href)}
                variant="outline"
                size="icon"
              >
                <ExternalLink />
              </Button>
            </div>
            <div>
              <h2 className="font-semibold cursor-pointer">{action.title}</h2>
              <p className="text-sm line-clamp-2 text-gray-500">
                {action.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
