const Alert = ({ alertText, alertType }) => {
  return (
    <div
      style={{
        display: 'flex',
        justifyItems: 'center',
        justifyContent: 'center',
        alignItems: 'center',
        top: '40px',
        zIndex: 1000,
      }}
      className='fixed__div__centered'
    >
      <div
        style={{
          paddingTop: '10px',
          paddingBottom: '10px',
          paddingRight: '24px',
          paddingLeft: '24px',
          fontSize: '24px',
          borderRadius: '5px',
        }}
        className={`${
          alertType ? 'bg-success text-dark' : 'text-white bg-danger'
        }`}
      >
        <span style={{}} className='py-1 px-2 sm:px-0 sm:py-0'>
          {alertText}
        </span>
      </div>
    </div>
  );
};

export default Alert;
