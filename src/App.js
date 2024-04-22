import { useState } from 'react';
import './App.css';
import axios from 'axios';

const SERVER_URL = 'https://whispering-basin-73310-3fb10001b160.herokuapp.com';
// const SERVER_URL = 'http://localhost:8080'
function App() {

  const [selectedFile, setSelectedFile] = useState();

  const onChangeFileUpload = (event) => {
    setSelectedFile(event.target.files[0])
  }

  const onMergeFile = (originalName, totalChunks) => {
    const formData = new FormData();
    formData.append("totalChunks", totalChunks);
    formData.append("originalName", originalName);
    console.log('onMergeFile');
    axios.post(SERVER_URL + '/local/api/v1/merge', formData)
    .then(res => {
      console.log(res);
    })
    .catch(err => {
      console.log(err);
    })

  }

  const onSubmitV2 = async () => {
    const chunkSize = 5 * 1024 * 1024; // 5MB (adjust based on your requirements)
    const totalChunks = Math.ceil(selectedFile.size / chunkSize);
    
    let upFileApi = [];
    var totalSuccess = 0;
    for (let i = 0; i < totalChunks; i++) {
      let start = chunkSize * i;
      let end = start + chunkSize;

      const chunk = selectedFile.slice(start, end);
      const formData = new FormData();
      formData.append('file', chunk);
      formData.append("chunkNumber", i);
      formData.append("totalChunks", totalChunks);
      formData.append("originalName", selectedFile.name);

      var api = new Promise((resolve, reject) => {
        axios.post(SERVER_URL + '/local/api/v1/upload', formData)
            .then(res => {
                resolve(res);                
            })
            .catch(err => {
                console.log(err);
                reject(err)
            })
      });
      upFileApi.push(api);
    }
    console.log("size: ", upFileApi.length);
    await Promise.all(upFileApi)
    .then(res => {
      console.log(res);
    });
    console.log('onMergeFile1');
    onMergeFile(selectedFile.name, totalChunks);

  }

  const onSubmit = () => {
    const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append("originalName", selectedFile.name);
    axios.post(SERVER_URL + '/upload-v1', formData)
      .then(res => {
        console.log(res);
      })
      .catch(err => {
          console.log(err);
      })
      
  }
  const onSubmitV3 = () => {
    const formData = new FormData();
    formData.append('type', selectedFile.name.split('.').pop());
    formData.append('mtId', "testaasdfs");

    axios.post(SERVER_URL + '/minio/api/v1/cerateUrl', formData)
    .then(res => {
      axios.put(res.data, selectedFile)
      .then(res => {
        console.log('success', res);
      })
      .catch(err => {
        console.log('error', err);
      });
    })
    .catch(err => {
      console.log(err);
    })
  }
  return (
    <div className="App">
      <input type='file' onChange={onChangeFileUpload}/>
      <button onClick={onSubmit}> Upload file</button>
      <button onClick={onSubmitV2}> Upload file V2</button>
      <button onClick={onSubmitV3}> Upload file V3</button>
    </div>
  );
}

export default App;
