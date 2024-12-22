import { Spinner } from "#app/components/ui/spinner";

const Loader = () => {
  return (
    <div className="absolute h-full w-full flex items-center justify-center bottom-0 left-1/2 transform -translate-x-1/2   backdrop-blur-[1px] rounded-xl">
      <div className="flex justify-center">
        <Spinner size="lg" className="bg-primary" />
      </div>
    </div>
  );
};

export default Loader;
