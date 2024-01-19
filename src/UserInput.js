import React, { useState , useEffect} from 'react';
import axios from 'axios';
import { TextField, Button } from '@mui/material';
import './UserInput.css'; 

function UserInput() {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');

  const [inputlist, setInputlist] = useState([]);
  const [responselist, setResponselist] = useState([]);
  
  const [SameSetIn, setSameSetIn] = useState(new Set());
  const [SameSetRes, setSameSetRes] = useState(new Set());



  // Define a regex that matches words and punctuation separately
  const regex = /(\b\w+('\w+)?\b)|([.,!?:;])/g;
  const punctuationSet = new Set(['.', ',', '!', '?', ':', ';']);
  const apiKey = process.env.REACT_APP_API_KEY;

  const handleInputChange = (e) => {
    const newInput = e.target.value;
    setInput(newInput);
  };

  useEffect(() => {
    if (responselist.length > 0) {
      getDifference();
    }
  }, [responselist]);

  const getDifference = () => {
      let n = inputlist.length, m = responselist.length;
      let dp = Array(n).fill().map(() => Array(m).fill(0));
      let newSameSetIn = new Set(), newSameSetRes = new Set();
      for(let i=0; i < n ;i++){
        for(let j=0; j < m ; j++){
          const s = inputlist[i] , t = responselist[j];
          if((!punctuationSet.has(s))&&(!punctuationSet.has(t))&&s==t){
            if(i>0 && j>0) dp[i][j]=dp[i-1][j-1];
            dp[i][j]++;
          }else{
            if(j>0) dp[i][j]=Math.max(dp[i][j-1],dp[i][j]);
            if(i>0) dp[i][j]=Math.max(dp[i-1][j],dp[i][j]);
          }
        }
      }
      let i=n-1, j=m-1;
      while(i>-1&&j>-1){
        const s = inputlist[i] , t = responselist[j];
        if((!punctuationSet.has(s))&&(!punctuationSet.has(t))&&s==t){
          newSameSetIn.add(i);
          newSameSetRes.add(j);
          i--;j--;
        }else if(i>0&&dp[i][j]==dp[i-1][j]){
          i--;
        }else{
          j--;
        }
      }
      setSameSetIn(newSameSetIn);
      setSameSetRes(newSameSetRes);
      
  };

  

  const handleSubmit = async (e) => {
    e.preventDefault();

    

    const conversation = [
        {"role": "system", "content": "Refine the input I send to you"},
        {"role": "user", "content": input},
    ];

    const requestData = {
        model: 'gpt-3.5-turbo',
        messages: conversation,
        temperature: 0.2
    };

    try {
        const resp = await axios.post('https://api.openai.com/v1/chat/completions', requestData, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            }
        });
        const newResponse = resp.data.choices[0].message.content;
        setInputlist(input.match(regex));
        setResponse(newResponse);
        setResponselist(newResponse.match(regex));
    } catch (error) {
        console.error("Error:", error);
        setResponse("Error in processing your request.");
    }

  };


  return (
    <div className="container">
      <form onSubmit={handleSubmit} className="form">
        <TextField
          label="Input"
          variant="outlined"
          fullWidth
          value={input}
          onChange={handleInputChange}
          style={{ marginBottom: '20px' }}
        />
        <Button variant="contained" color="primary" type="submit" fullWidth>
          Submit
        </Button>
      </form>

      <p>User input:</p>
      <div className="textDisplay">
        {inputlist && inputlist.map((element, index) => (
          <span
            key={index}
            style={{ color: SameSetIn.has(index)||punctuationSet.has(element) ? 'black' : 'red', marginRight: '4px' }}
          >
            {element}
          </span>
        ))}
      </div>

      <p>Response from OpenAI:</p>
      <div className="textDisplay">
        {responselist && responselist.map((element, index) => (
          <span
            key={index}
            style={{ color: SameSetRes.has(index)||punctuationSet.has(element) ? 'black' : 'orange', marginRight: '4px' }}
          >
            {element}
          </span>
        ))}
      </div>
    </div>
  );
}

export default UserInput;
