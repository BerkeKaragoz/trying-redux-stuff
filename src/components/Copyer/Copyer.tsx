type Props = {
  text?: string | number | symbol | null;
};

const Copyer: React.FC<Props> = (props) => {
  const { text } = props;

  return (
    <pre
      onClick={() => {
        text && navigator.clipboard.writeText(text.toString());
      }}
      style={{ cursor: "copy", userSelect: "all" }}
    >
      {text}
    </pre>
  );
};

export default Copyer;
