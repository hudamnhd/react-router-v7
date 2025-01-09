import { X } from "lucide-react";
import { cn } from "#app/utils/misc.tsx";
import {
  animate,
  AnimatePresence,
  motion,
  useMotionTemplate,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
} from "framer-motion";
import { Dialog, Heading, Modal, ModalOverlay } from "react-aria-components";
import { useState } from "react";
import { Button } from "#app/components/ui/button";

// Wrap React Aria modal components so they support framer-motion values.
const MotionModal = motion(Modal);
const MotionModalOverlay = motion(ModalOverlay);

const inertiaTransition = {
  type: "inertia" as const,
  bounceStiffness: 300,
  bounceDamping: 40,
  timeConstant: 300,
};

const staticTransition = {
  duration: 0.5,
  ease: [0.32, 0.72, 0, 1],
};

const SHEET_MARGIN = 34;
const SHEET_RADIUS = 10;

export function Sheet() {
  const root = document.body.firstChild as HTMLElement;
  let [isOpen, setOpen] = useState(false);
  let h = window.innerHeight - SHEET_MARGIN;
  let y = useMotionValue(h);
  let bgOpacity = useTransform(y, [0, h], [0.4, 0]);
  let bg = useMotionTemplate`rgba(0, 0, 0, ${bgOpacity})`;

  // Scale the body down and adjust the border radius when the sheet is open.
  let bodyScale = useTransform(
    y,
    [0, h],
    [(window.innerWidth - SHEET_MARGIN) / window.innerWidth, 1],
  );
  let bodyTranslate = useTransform(y, [0, h], [SHEET_MARGIN - SHEET_RADIUS, 0]);
  let bodyBorderRadius = useTransform(y, [0, h], [SHEET_RADIUS, 0]);

  useMotionValueEvent(bodyScale, "change", (v) => (root.style.scale = `${v}`));
  useMotionValueEvent(
    bodyTranslate,
    "change",
    (v) => (root.style.translate = `0 ${v}px`),
  );
  useMotionValueEvent(
    bodyBorderRadius,
    "change",
    (v) => (root.style.borderRadius = `${v}px`),
  );

  return (
    <div className="my-5">
      <Button onPress={() => setOpen(true)}>Open sheet</Button>
      <AnimatePresence>
        {isOpen && (
          <MotionModalOverlay
            // Force the modal to be open when AnimatePresence renders it.

            isDismissable
            isOpen
            onOpenChange={setOpen}
            className="fixed inset-0 z-10"
            style={{ backgroundColor: bg as any }}
          >
            <MotionModal
              className="bg-background absolute bottom-0 left-0 right-0 rounded-t-[10px] shadow-lg will-change-transform border-t"
              initial={{ y: h }}
              animate={{ y: 0 }}
              exit={{ y: h }}
              transition={staticTransition}
              style={{
                y,
                // top: "0vh",
                bottom: "0vh",
                top: SHEET_MARGIN,
                // Extra padding at the bottom to account for rubber band scrolling.
                // paddingBottom: window.screen.height,
              }}
              drag="y"
              dragConstraints={{ top: 0 }}
              onDragEnd={(e, { offset, velocity }) => {
                if (offset.y > window.innerHeight * 0.75 || velocity.y > 10) {
                  setOpen(false);
                } else {
                  animate(y, 0, { ...inertiaTransition, min: 0, max: 0 });
                }
              }}
            >
              {/* drag affordance */}
              <div className="mx-auto w-[100px] mt-3 h-1.5 rounded-full bg-muted" />
              <Dialog className="grid h-full px-4 pb-4 outline-none">
                <div className="h-full flex flex-col overflow-y-auto">
                  <div className="grid gap-1.5 p-4 text-center sm:text-left">
                    <Heading
                      slot="title"
                      className="text-lg font-semibold leading-none tracking-tight"
                    >
                      Modal sheet
                    </Heading>

                    <p className="text-sm text-muted-foreground">
                      This is a dialog with a custom modal overlay built with
                      React Aria Components and Framer Motion.
                    </p>
                  </div>
                  <div className="px-4 flex-1">
                    <p className="">
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                      Aenean sit amet nisl blandit, pellentesque eros eu,
                      scelerisque eros. Sed cursus urna at nunc lacinia dapibus.
                    </p>
                  </div>

                  <div className="mt-auto mx-auto w-fit flex flex-col gap-2 p-4">
                    <Button variant="outline" onPress={() => setOpen(false)}>
                      <X /> Close
                    </Button>
                  </div>
                </div>
              </Dialog>
            </MotionModal>
          </MotionModalOverlay>
        )}
      </AnimatePresence>
    </div>
  );
}
