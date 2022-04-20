type Props = {};

const Footer: React.FC<Props> = (props) => {
  const { children } = props;

  return (
    <footer {...props}>
      <hr />
      {children}
    </footer>
  );
};

export type { Props as FooterProps };
export default Footer;
