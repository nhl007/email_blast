import React, { useEffect, useRef, useState } from 'react';
import './App.css';
import EmailEditor from 'react-email-editor';
import Alert from './Alert';

const data = {
  subject: '',
  userName: '',
  clientId: '',
  clientSecret: '',
  accessToken: '',
};

const App = () => {
  const emailEditorRef = useRef(null);

  const [Values, setValues] = useState(data);
  const [isActive, setIsActive] = useState(false);

  // ? Alert setup
  const [showAlert, setShowAlert] = useState(false);
  const [alertText, setAlertText] = useState('Default Alert Text !');
  const [alertType, setAlertType] = useState(false);
  const [designMenu, setDesignMenu] = useState(false);

  const clearAlert = () => {
    setTimeout(() => {
      setAlertText(null);
      setShowAlert(false);
    }, 3000);
  };

  const handlechange = (e) => {
    setValues({ ...Values, [e.target.name]: e.target.value });
  };

  //todo------------------------------------------------------------------------------------

  //! save design

  const [designName, setDesignName] = useState('');
  const [showDesignConfirmation, setShowDesignConfirmation] = useState(false);
  const [refresh, setrefresh] = useState(false);

  const saveDesign = () => {
    emailEditorRef.current.editor.exportHtml((data) => {
      const { design, html } = data;
      localStorage.setItem(
        `emailDesign,${designName}`,
        JSON.stringify({
          key: designName,
          design: design,
        })
      );
      localStorage.setItem(
        `emailHtml,${designName}`,
        JSON.stringify({
          key: designName,
          html: html,
        })
      );
      setSavedDesigns([]);
      setrefresh((prev) => !prev);
    });
  };

  //! Load design

  const onLoad = (key) => {
    const design = JSON.parse(localStorage.getItem(`emailDesign,${key}`));
    emailEditorRef.current.editor.loadDesign(design.design);
    setDesignMenu((prev) => !prev);
    window.scrollTo(0, 0);
  };

  const [savedDesigns, setSavedDesigns] = useState([]);

  async function showSavedDesigns() {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.includes('emailHtml')) {
        const design = await JSON.parse(localStorage.getItem(key));
        setSavedDesigns((oldArray) => [...oldArray, design]);
      }
    }
  }

  async function onDeleteDesign(key) {
    localStorage.removeItem(`emailDesign,${key}`);
    localStorage.removeItem(`emailHtml,${key}`);
    window.scrollTo(0, 0);
    setDesignMenu((prev) => !prev);
    setrefresh((prev) => !prev);
  }

  //todo--------------------------------------------------------------------------------------

  //! html data
  const [htmldata, setHtmldata] = useState(null);

  const exportHtml = async () => {
    await emailEditorRef.current.editor.exportHtml(async (data) => {
      const { html } = await data;
      setHtmldata(html);
    });
  };

  //! handle csv file
  const [file, setFile] = useState(null);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  //! submit all data

  const onSubmit = async (e) => {
    e.preventDefault();
    setIsActive(true);

    if (!file || !htmldata) {
      setIsActive(false);
      setShowAlert(true);
      setAlertType(false);
      setAlertText('Please provide all information !');
      clearAlert();
    } else {
      const formData = new FormData();

      formData.append('csvfile', file);
      formData.append('html', htmldata);

      await fetch('http://127.0.0.1:8000/api/v1/sendemails', {
        method: 'POST',
        body: formData,
      })
        .then((response) => response.json())
        .then((data) => {
          setShowAlert(true);
          setAlertType(true);
          setAlertText(data.message);
        })
        .catch((e) => {
          setShowAlert(true);
          setAlertType(false);
          setAlertText(e.message);
        })
        .finally(() => {
          setIsActive(false);
          clearAlert();
        });
    }
  };

  const loaddesignarray = async () => {
    setSavedDesigns([]);
    await showSavedDesigns();
  };

  useEffect(() => {
    loaddesignarray();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refresh]);

  return (
    <div
      style={{
        scrollBehavior: 'smooth',
      }}
    >
      {isActive && (
        <div className=' z-[999] spinner opacity-75'>
          <div className='loader'></div>
          <p
            style={{
              marginTop: '40px',
            }}
            className='text-lg'
          >
            Loading... Please Wait...
          </p>
        </div>
      )}

      {showAlert && <Alert alertText={alertText} alertType={alertType} />}

      <div className='container p-lg-2 my-5 bg-opacity-100 bg-light shadow-lg p-lg-5 '>
        <h1 className='text-center mt-3'>Email Blast</h1>
        <div className=' mt-4 mb-3'>
          <h4>Edit template: </h4>
          <EmailEditor ref={emailEditorRef} minHeight='80vh' minWidth='100vw' />
        </div>
        {showDesignConfirmation && (
          <div>
            <input
              onChange={(e) => {
                setDesignName(e.target.value);
              }}
              style={{
                border: '1px solid red',
                color: 'red',
              }}
              className='form-control'
              type='text'
              placeholder='type the design name..'
            />
            <button
              onClick={saveDesign}
              className=' font-monospace btn btn-block btn-danger self mt-4'
            >
              Confirm
            </button>
          </div>
        )}
        <div
          style={{ gap: '20px', position: 'relative', paddingTop: '24px' }}
          className='form-group text-center mt-2 d-flex'
        >
          <button
            onClick={exportHtml}
            className=' font-monospace btn btn-block btn-danger self'
          >
            Export HTML
          </button>
          <button
            onClick={() => {
              setShowDesignConfirmation((prev) => !prev);
            }}
            className=' font-monospace btn btn-block btn-danger self'
          >
            Save Template
          </button>
          <button
            onClick={() => setDesignMenu((prev) => !prev)}
            className=' font-monospace btn btn-block btn-danger self'
          >
            View Templates
          </button>
        </div>

        {designMenu && (
          <div className='__load__design__container__main'>
            <div className='__load__design__container'>
              <div
                onClick={() => setDesignMenu((prev) => !prev)}
                className='__cancel__div'
              >
                {' '}
                ❌{' '}
              </div>
              <h1>Select Your Saved Design :</h1>
              {savedDesigns?.map((design, index) => (
                <div style={{ marginTop: '40px' }} key={design.key + index}>
                  <h2>Name : {design.key}</h2>
                  <div>
                    {
                      <div>
                        <div
                          dangerouslySetInnerHTML={{ __html: design.html }}
                        />
                      </div>
                    }
                  </div>
                  <button
                    onClick={() => onDeleteDesign(design.key)}
                    style={{ marginRight: '16px' }}
                    className='btn btn-block btn-danger mt-4'
                  >
                    delete
                  </button>
                  <button
                    onClick={() => onLoad(design.key)}
                    className='btn btn-block btn-danger mt-4 ml-4'
                  >
                    Load Design
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className='form-group my-3'>
          <label htmlFor='attachment' className='fs-5 my-2'>
            Upload CSV File ['Recommended Contact Email'] :
          </label>
          <input
            onChange={handleFileChange}
            type='file'
            required
            className='form-control'
            accept='.csv'
          />
        </div>
        <form onSubmit={onSubmit} className=' my-5'>
          <h4>Email Configuration [Gmail Api]</h4>
          <div className='form-group my-3'>
            <input
              onChange={handlechange}
              className='form-control text-lowercase fs-5'
              type='text'
              name='subject'
              required
              placeholder='Subject of the email :'
            />
          </div>
          <div className='form-group my-3'>
            <input
              onChange={handlechange}
              className='form-control text-lowercase fs-5'
              type='email'
              name='userName'
              required
              placeholder='User :'
            />
          </div>
          <div className='form-group my-3'>
            <input
              onChange={handlechange}
              type='text'
              className='form-control text-lowercase fs-5'
              name='clientId'
              placeholder='clientId :'
              required
            />
          </div>
          <div className='form-group my-3'>
            <input
              onChange={handlechange}
              type='text'
              className='form-control fs-5'
              name='clientSecret'
              placeholder='clientSecret :'
              required
            />
          </div>
          <div className='form-group my-3'>
            <input
              onChange={handlechange}
              type='text'
              className='form-control fs-5'
              name='accessToken'
              placeholder='accessToken :'
              required
            />
          </div>
          <div className='form-group my-3 text-center mt-5'>
            {/* {csvBtn && htmlBtn ? ( */}
            <button type='submit' className='btn btn-block btn-danger fs-5'>
              Send multiple Email listed on the file
            </button>
            {/* ) : (
              <button
                disabled
                type='submit'
                className='btn btn-block btn-danger fs-5'
              >
                Send multiple Email listed on the file
              </button>
            )} */}
          </div>
        </form>
      </div>
    </div>
  );
};

export default App;
