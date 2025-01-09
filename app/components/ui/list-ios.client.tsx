import { Button, GridList, GridListItem } from "react-aria-components";
import type { Selection, SelectionMode } from "react-aria-components";
import {
  animate,
  AnimatePresence,
  motion,
  useIsPresent,
  useMotionTemplate,
  useMotionValue,
  useMotionValueEvent,
} from "framer-motion";
import { useRef, useState } from "react";
import type { CSSProperties } from "react";

const MotionItem = motion.create(GridListItem);
const inertiaTransition = {
  type: "inertia" as const,
  bounceStiffness: 300,
  bounceDamping: 40,
  timeConstant: 300,
};

const emails = [
  {
    id: "8d1fb670-4752-4bc1-a35b-c4e12e398e07",
    sender: "Brian Long",
    date: "2025-01-06 20:16:13",
    subject: "Sport audience economy statement one sign.",
    message:
      "Ready pass yes necessary sometimes friend. Career need project south surface member. Nearly professor off lead.",
  },
  {
    id: "0fe29823-bd90-43a8-80a9-110b1f1d1d4e",
    sender: "Mary Jones",
    date: "2025-01-02 08:31:20",
    subject: "Else deal animal read.",
    message:
      "Company gas between opportunity. Relate yeah indeed read president so.",
  },
  {
    id: "adfe49e7-d252-447f-a879-c289010f6dc1",
    sender: "Thomas Swanson",
    date: "2025-01-03 18:05:47",
    subject: "Measure everybody public picture accept indeed.",
    message:
      "Own dream follow official professor. International say hand item though discover official fish. Example line seat voice democratic relationship ok science.",
  },
  {
    id: "3297d032-c394-4901-b8ad-7e41de3c60c7",
    sender: "Carolyn Joseph",
    date: "2025-01-06 17:59:07",
    subject: "Song item hour under short.",
    message:
      "Consumer three space detail. This hear let foot now decade contain.",
  },
  {
    id: "66fe7aa9-5861-400c-8e06-af63914dda0f",
    sender: "Rachel Levy",
    date: "2025-01-02 09:05:45",
    subject: "Theory discussion science work environmental religious.",
    message: "Feel clear law control. Try leave time would stage.",
  },
];
export function SwipableList() {
  let [items, setItems] = useState(emails);
  let [selectedKeys, setSelectedKeys] = useState<Selection>(new Set());
  let [selectionMode, setSelectionMode] = useState<SelectionMode>("none");
  let onDelete = () => {
    setItems(
      items.filter((i) => selectedKeys !== "all" && !selectedKeys.has(i.id)),
    );
    setSelectedKeys(new Set());
    setSelectionMode("none");
  };

  return (
    <div className="flex flex-col h-full max-h-[500px] sm:w-[400px] -mx-[14px] sm:mx-0 mt-4">
      {/* Toolbar */}
      <div className="flex pb-4 justify-between">
        <Button
          className="text-blue-600 outline-none bg-transparent border-none transition pressed:text-blue-700 focus-visible:ring disabled:text-gray-400"
          style={{ opacity: selectionMode === "none" ? 0 : 1 }}
          isDisabled={selectedKeys !== "all" && selectedKeys.size === 0}
          onPress={onDelete}
        >
          Delete
        </Button>
        <Button
          className="text-blue-600 outline-none bg-transparent border-none transition pressed:text-blue-700 focus-visible:ring"
          onPress={() => {
            setSelectionMode((m) => (m === "none" ? "multiple" : "none"));
            setSelectedKeys(new Set());
          }}
        >
          {selectionMode === "none" ? "Edit" : "Cancel"}
        </Button>
      </div>
      <GridList
        className="relative flex-1 overflow-auto"
        aria-label="Inbox"
        onAction={selectionMode === "none" ? () => {} : undefined}
        selectionMode={selectionMode}
        selectedKeys={selectedKeys}
        onSelectionChange={setSelectedKeys}
      >
        <AnimatePresence>
          {items.map((item) => (
            <ListItem
              key={item.id}
              id={item.id}
              textValue={[
                item.sender,
                item.date,
                item.subject,
                item.message,
              ].join("\n")}
              onRemove={() => setItems(items.filter((i) => i !== item))}
            >
              <div className="flex flex-col text-md cursor-default text-sm">
                <div className="flex justify-between">
                  <p className="font-bold text0-base m-0">{item.sender}</p>
                  <p className="text-gray-500 m-0">{item.date}</p>
                </div>
                <p className="m-0">{item.subject}</p>
                <p className="line-clamp-2 text-gray-500 dark:text-gray-400 m-0">
                  {item.message}
                </p>
              </div>
            </ListItem>
          ))}
        </AnimatePresence>
      </GridList>
    </div>
  );
}

function ListItem({ id, children, textValue, onRemove }) {
  let ref = useRef(null);
  let x = useMotionValue(0);
  let isPresent = useIsPresent();
  let xPx = useMotionTemplate`${x}px`;

  // Align the text in the remove button to the left if the
  // user has swiped at least 80% of the width.
  let [align, setAlign] = useState("end");
  useMotionValueEvent(x, "change", (x) => {
    let a = x < -ref.current?.offsetWidth * 0.8 ? "start" : "end";
    setAlign(a);
  });

  return (
    <MotionItem
      id={id}
      textValue={textValue}
      className="outline-none group relative overflow-clip border-t border-0 border-solid last:border-b border-gray-200 dark:border-gray-800 pressed:bg-gray-200 dark:pressed:bg-gray-800 selected:bg-gray-200 dark:selected:bg-gray-800 focus-visible:outline focus-visible:outline-blue-600 focus-visible:-outline-offset-2"
      layout
      transition={{ duration: 0.25 }}
      exit={{ opacity: 0 }}
      // Take item out of the flow if it is being removed.
      style={{ position: isPresent ? "relative" : "absolute" }}
    >
      {/* @ts-ignore - Framer Motion's types don't handle functions properly. */}
      {({ selectionMode, isSelected }) => (
        // Content of the item can be swiped to reveal the delete button, or fully swiped to delete.
        <motion.div
          ref={ref}
          style={{ x, "--x": xPx } as CSSProperties}
          className="flex items-center"
          drag={selectionMode === "none" ? "x" : undefined}
          dragConstraints={{ right: 0 }}
          onDragEnd={(e, { offset }) => {
            // If the user dragged past 80% of the width, remove the item
            // otherwise animate back to the nearest snap point.
            let v = offset.x > -20 ? 0 : -100;
            if (x.get() < -ref.current.offsetWidth * 0.8) {
              v = -ref.current.offsetWidth;
              onRemove();
            }
            animate(x, v, { ...inertiaTransition, min: v, max: v });
          }}
          onDragStart={() => {
            // Cancel react-aria press event when dragging starts.
            document.dispatchEvent(new PointerEvent("pointercancel"));
          }}
        >
          {selectionMode === "multiple" && (
            <SelectionCheckmark isSelected={isSelected} />
          )}
          <motion.div
            layout
            layoutDependency={selectionMode}
            transition={{ duration: 0.25 }}
            className="relative flex items-center px-4 py-2 z-10"
          >
            {children}
          </motion.div>
          {selectionMode === "none" && (
            <Button
              className="bg-red-600 pressed:bg-red-700 cursor-default text-lg outline-none border-none transition-colors text-white flex items-center absolute top-0 left-[100%] py-2 h-full z-0 isolate focus-visible:outline focus-visible:outline-blue-600 focus-visible:-outline-offset-2"
              style={{
                // Calculate the size of the button based on the drag position,
                // which is stored in a CSS variable above.
                width: "max(100px, calc(-1 * var(--x)))",
                justifyContent: align,
              }}
              onPress={onRemove}
              // Move the button into view when it is focused with the keyboard
              // (e.g. via the arrow keys).
              onFocus={() => x.set(-100)}
              onBlur={() => x.set(0)}
            >
              <motion.span
                initial={false}
                className="px-4"
                animate={{
                  // Whenever the alignment changes, perform a keyframe animation
                  // between the previous position and new position. This is done
                  // by calculating a transform for the previous alignment and
                  // animating it back to zero.
                  transform:
                    align === "start"
                      ? ["translateX(calc(-100% - var(--x)))", "translateX(0)"]
                      : ["translateX(calc(100% + var(--x)))", "translateX(0)"],
                }}
              >
                Delete
              </motion.span>
            </Button>
          )}
        </motion.div>
      )}
    </MotionItem>
  );
}

function SelectionCheckmark({ isSelected }) {
  return (
    <motion.svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="w-6 h-6 flex-shrink-0 ml-4"
      initial={{ x: -40 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.25 }}
    >
      {!isSelected && (
        <circle
          r={9}
          cx={12}
          cy={12}
          stroke="currentColor"
          fill="none"
          strokeWidth={1}
          className="text-gray-400"
        />
      )}
      {isSelected && (
        <path
          className="text-blue-600"
          fillRule="evenodd"
          d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
          clipRule="evenodd"
        />
      )}
    </motion.svg>
  );
}
