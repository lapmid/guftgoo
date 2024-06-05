import React, { FormEvent } from "react";

export const TransferPage: React.FC = (): JSX.Element => {
  const [content, setContent] = React.useState<string>("");
  
  const handleSave = (): void => {
    
    if (true) {
      const endpoint = window.location.origin + "/transfer/save";
      
      fetch("https://guftgu.onrender.com/transfer/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({content}),
      })
        .then((data): void => {
          if (data.status === 201) {
            alert("saved");
          }
        })
        .catch((e): void => {
          alert(JSON.stringify(e));
        })
        .finally(() => {
          
        });
    }
  };

  return (
    <div style={{position: 'relative',height: '100%'}}>
      <button style={{width: '100%',background: 'blue', color: 'black'}} onClick={handleSave}>submit</button>
      <div style={{height: '100%',position: 'relative',marginBottom:'10px',border:'1px solid black'}}>
        <textarea style={{height:'100%',width: '100%',background:'#f1f1f1'}} placeholder="type content" value={content} onChange={(event)=>{
          setContent(event.target.value);
        }} >
        </textarea>
      </div>
    </div>
  );
};
