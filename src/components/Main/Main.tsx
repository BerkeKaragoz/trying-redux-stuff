import ErrorBoundary from "@/components/ErrorBoundary";

type Props = {};

const Main: React.FC<Props> = (props) => {
  const { children } = props;

  return (
    <div className="flex-grow">
      <main>
        <ErrorBoundary>{children}</ErrorBoundary>
      </main>
    </div>
  );
};

export type { Props as MainProps };
export default Main;
