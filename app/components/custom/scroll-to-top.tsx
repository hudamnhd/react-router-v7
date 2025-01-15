import React from "react";
import { cn } from "#app/utils/misc.tsx";
import { Button } from "#app/components/ui/button";
import { ArrowUp } from "lucide-react";

export const ScrollTopButton = ({
  container,
}: { container: React.RefObject<HTMLDivElement> | null }) => {
  const [showGoTop, setShowGoTop] = React.useState(false);

  const handleVisibleButton = () => {
    if (container?.current) {
      const shouldShow = container.current.scrollTop > 50;
      if (shouldShow !== showGoTop) {
        setShowGoTop(shouldShow);
      }
    }
  };

  const handleScrollUp = () => {
    container?.current?.scrollTo({ left: 0, top: 0, behavior: "smooth" });
  };

  React.useEffect(() => {
    const currentContainer = container?.current;
    if (!currentContainer) return;

    currentContainer.addEventListener("scroll", handleVisibleButton);

    return () => {
      currentContainer.removeEventListener("scroll", handleVisibleButton);
    };
  }, [container, showGoTop]);

  return (
    <div
      className={cn(
        "sticky inset-x-0 ml-auto w-fit -translate-x-3 z-[60] bottom-0 -mt-11",
        !showGoTop && "hidden",
      )}
    >
      <Button onPress={handleScrollUp} variant="default" size="icon">
        <ArrowUp />
      </Button>
    </div>
  );
};

export const ScrollToFirstIndex = ({
  handler,
  container,
  className,
}: {
  handler: () => void;
  container: React.RefObject<HTMLDivElement> | null;
  className?: string;
}) => {
  const [showGoTop, setShowGoTop] = React.useState(false);

  const handleVisibleButton = () => {
    if (container?.current) {
      const shouldShow = container.current.scrollTop > 50;
      if (shouldShow !== showGoTop) {
        setShowGoTop(shouldShow);
      }
    }
  };

  const handleScrollUp = () => {
    handler();
  };

  React.useEffect(() => {
    const currentContainer = container?.current;
    if (!currentContainer) return;

    currentContainer.addEventListener("scroll", handleVisibleButton);

    return () => {
      currentContainer.removeEventListener("scroll", handleVisibleButton);
    };
  }, [container, showGoTop]);

  return (
    <div
      className={cn(
        "sticky inset-x-0 ml-auto w-fit -translate-x-5 z-[60] bottom-0 -mt-11",
        !showGoTop && "hidden",
        className,
      )}
    >
      <Button onPress={handleScrollUp} variant="default" size="icon">
        <ArrowUp />
      </Button>
    </div>
  );
};
