import React, { useRef, useState } from "react";
import "./App.css";
import EmailEditor from "react-email-editor";
import axios from "axios";

const App = () => {
  const data = {
    subject: "",
    hostName: "",
    userName: "",
    password: "",
  };

  const [Values, setValues] = useState(data);
  const [isActive, setIsActive] = useState(false);
  const [successpopup, setSuccesspopup] = useState(false);
  const [errorpopup, setErrorpopup] = useState(false);

  const [htmlBtn, sethtmlBtn] = useState(false);
  const [csvBtn, setcsvBtn] = useState(false);

  // const [selectedFile, setSelectedFile] = useState(null);

  const emailEditorRef = useRef(null);
  // console.log('emailEditorRef 1', emailEditorRef);
  const exportHtml = async () => {
    await emailEditorRef.current.editor.exportHtml(async (data) => {
      const { html } = await data;
      // console.log('emailEditorRef 2', emailEditorRef);
      // console.log('exportHtml', html);
      await axios
        .post("http://localhost:9000/submitHtml", {
          html: html,
        })
        .then((res) => {
          sethtmlBtn(true);
          console.log(res.data);
        });
    });
  };

  const upload = async (e) => {
    const files = e.target.files;
    const formData = new FormData();
    formData.append("csvfile", files[0]);
    await fetch("http://localhost:9000/submitCsv", {
      method: "POST",
      body: formData,
    }).then((resp) => {
      resp.json().then((resp) => {
        console.log(resp);
        setcsvBtn(true);
      });
    });
  };

  const handlechange = (e) => {
    e.preventDefault();
    setValues({ ...Values, [e.target.name]: e.target.value });
  };
  // const onfileChange = (e) => {
  //   e.preventDefault();
  //   setSelectedFile(e.target.files[0]);
  // };
  // const submitCsv = async () => {
  //   await axios
  //     .post('http://localhost:9000/submitCsv', selectedFile)
  //     .then((res) => {
  //       console.log(res);
  //     });
  //   setcsvBtn(true);
  // };

  const onSubmit = async (e) => {
    e.preventDefault();
    setIsActive(true);
    await axios.post("http://localhost:9000/sendemail", Values).then((res) => {
      if (res.data === "success") {
        setIsActive(false);
        setSuccesspopup(true);
      } else {
        setIsActive(false);
        setErrorpopup(true);
      }
    });
    setTimeout(() => {
      setSuccesspopup(false);
      setErrorpopup(false);
    }, 2000);
  };

  return (
    <div className="App-header font-monospace">
      {isActive && (
        <div className="spinner opacity-75 position-absolute">
          <div className="loader"></div>
          <p className=" mt-5">Loading... Please Wait...</p>
        </div>
      )}
      {successpopup && (
        <div className="spinner bg-success opacity-75 position-absolute">
          <div className=""></div>
          <p style={{ color: "white" }} className=" mt-5 fs-1">
            Successfully sent the emails...
          </p>
        </div>
      )}
      {errorpopup && (
        <div className="spinner bg-danger opacity-75 position-absolute">
          <div className=""></div>
          <p style={{ color: "white" }} className="mt-5 fs-1">
            An error occured! Try again...
          </p>
        </div>
      )}

      <div className="container p-lg-2 my-5 bg-opacity-100 bg-light shadow-lg p-lg-5 ">
        <h1 className="text-center mt-3">Email Blast</h1>
        <div className=" mt-4 mb-3">
          <h4>Edit template: </h4>
          <EmailEditor ref={emailEditorRef} minHeight="60vh" />
          {/* onLoad={onLoad} */}
        </div>
        <div className="form-group text-center mt-2 d-flex">
          {/* <button
            className=' font-monospace btn btn-block btn-danger'
            onClick={saveDesign}>
            Save Design
          </button> */}
          <button
            onClick={exportHtml}
            className=" font-monospace btn btn-block btn-danger self">
            Export HTML
          </button>
        </div>
        <div className="form-group my-3">
          <label htmlFor="attachment" className="fs-5 my-2">
            Upload CSV File ['Recommended Contact Email'] :
          </label>
          <input
            // onChange={onfileChange}
            onChange={(e) => upload(e)}
            name="img"
            type="file"
            required
            className="form-control"
            accept=".csv"
          />
        </div>
        <form onSubmit={onSubmit} className=" my-5">
          <h4>Email Configaration</h4>
          <div className="form-group my-3">
            <input
              onChange={handlechange}
              className="form-control text-lowercase fs-5"
              type="text"
              name="subject"
              required
              placeholder="Subject :"
            />
          </div>
          <div className="form-group my-3">
            <input
              onChange={handlechange}
              className="form-control text-lowercase fs-5"
              type="text"
              name="hostName"
              required
              placeholder="Email Host :"
            />
          </div>
          <div className="form-group my-3">
            <input
              onChange={handlechange}
              type="email"
              className="form-control text-lowercase fs-5"
              name="userName"
              placeholder="User Name :"
              required
            />
          </div>
          <div className="form-group my-3">
            <input
              onChange={handlechange}
              type="password"
              className="form-control fs-5"
              name="password"
              placeholder="Password: "
              required
            />
          </div>
          <div className="form-group my-3 text-center mt-5">
            {csvBtn && htmlBtn ? (
              <button type="submit" className="btn btn-block btn-danger fs-5">
                Send multiple Email listed on the file
              </button>
            ) : (
              <button
                disabled
                type="submit"
                className="btn btn-block btn-danger fs-5">
                Send multiple Email listed on the file
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default App;

// const onDesignLoad = (data) => {
//   console.log('onDesignLoad', data);
// };

// const onLoad = () => {
//   emailEditorRef.current.editor.addEventListener(
//     "onDesignLoad",
//     onDesignLoad
//   );
//   emailEditorRef.current.editor.loadDesign(sample);
// };

// const saveDesign = () => {
//   emailEditorRef.current.editor.saveDesign((design) => {
//     console.log('saveDesign', JSON.stringify(design, null, 4));
//     alert('Design JSON has been logged in your developer console.');
//   });
// };
