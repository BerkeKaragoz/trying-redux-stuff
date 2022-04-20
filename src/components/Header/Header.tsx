type Props = {};

const Header: React.FC<Props> = (props) => {
  const { children } = props;

  return (
    <>
      <header {...props} className="app-header">
        <h1>Trying Redux Stuff</h1>
        {children}
      </header>
      <div></div>
    </>
  );
};

export type { Props as HeaderProps };
export default Header;
