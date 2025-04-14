import React, { useState, useRef, useEffect } from 'react';
import { Button } from 'antd';
import { InputNumber } from 'antd';

const Instace = (props) => {
  const [status, setStatus] = useState("recover");
  useEffect(() => {
    if(props.id == props.leader) {
      setStatus("leader")
    }
    if(status == "leader" && props.id != props.leader) {
      setStatus("recover")
    }
  },[props])
  
  const buttonStyle = {
    margin: '8px',
    width: '48px',
    height: '48px',
    borderRadius: '50%', 
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold'
  };
  
  const Recover = (
    <Button 
      type="primary" 
      style={buttonStyle} 
      onClick={() => {setStatus("crash"); props.crash(props.id)}}
      recover={props.recover}
    > 
      {props.id} 
    </Button>
  )
  
  const Crash = (
    <Button 
      type="dashed" 
      style={{ ...buttonStyle, opacity: 0.5 }} 
      onClick={() => {setStatus("recover"); props.recover(props.id)}}
    > 
      {props.id} 
    </Button>
  )
  
  const Leader = (
    <Button 
      type="primary" 
      style={{ ...buttonStyle, backgroundColor: '#52c41a', borderColor: '#52c41a' }} 
      onClick={() => {setStatus("crash"); props.startElection(true)}}
    > 
      {props.id} 
    </Button>
  )
  
  const Route = () => {
    if (status == "recover") {
      return Recover
    } else if (status == "crash") {
      return Crash
    } else if (status == "leader") {
      return Leader 
    }
  }
  
  return (
    <div className="instance-container">
      {Route()}
    </div>
  );
};

export default function Circle() {
  const [leader, setLeader] = useState(0);
  const [numProcesses, setNumProcesses] = useState(0);
  const [log, setLog] = useState([])
  const [alive, setAlive] = useState([])
  
  const onChange = value => {
    setNumProcesses(value)
    setLog([`Khởi tạo ${value} Instance`])
    setLeader(value)
    setAlive(Array.from({ length: value }, (_, i) => i + 1))
  };
  
  const chunkArray = (array, chunkSize) => {
    const chunks = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  };
  
  const recover = (value) => {
    const newAlive = [...alive, value].sort((a, b) => a - b)
    setAlive(newAlive)
    
    let newLog = [...log, `Instance ${value} đã khởi động lại`];
    
    var randomIndex = newAlive.findIndex(item => item == value);
    
    if(value > leader) {
      for(let i = randomIndex; i < newAlive.length; i++) {
        for(let j = newAlive[i]+1; j <= numProcesses; j++) {
          newLog.push(`Instance ${newAlive[i]} gửi message Election đến Instance ${j}`);
        }
        
        for(let j = newAlive.length - 1 ; j > i; j--) {
          newLog.push(`Instance ${newAlive[j]} gửi message OK đến Instance ${newAlive[i]}`);
        }
      }
      
      const newLeader = Math.max(...newAlive)
      setLeader(newLeader)
      
      newLog.push(`Instance ${newLeader} trở thành Leader mới`);
      
      for(let i = 0; i < newAlive.length; i++) {
        if(newAlive[i] !== newLeader) {
          newLog.push(`Instance ${newLeader} gửi message I won đến Instance ${newAlive[i]}`);
        }
      }
      
      newLog.push(`Kết thúc Election`);
    }
    
    setLog(newLog);
  }

  const crash = (value) => {
    const newAlive = alive.filter(item => item != value)
    setAlive(newAlive)
    console.log(newAlive)
  }

  const startElection = (value) => {
    const newAlive = alive.filter(item => item != leader);
    setAlive(newAlive);
    
    let newLog = [...log];
    
    const randomIndex = Math.floor(Math.random() * newAlive.length);
    const randomValue = newAlive[randomIndex];
    
    newLog.push(`Instance ${randomValue} phát hiện Leader: Instance ${leader} bị crash, Instance ${randomValue} khởi tạo bầu cử`);
    
    for(let i = randomIndex; i < newAlive.length; i++) {
      for(let j = newAlive[i]+1; j <= numProcesses; j++) {
        if (newAlive.includes(j)) {
          newLog.push(`Instance ${newAlive[i]} gửi message Election đến Instance ${j}`);
        }
      }
      
      for(let j = newAlive.length - 1; j > i; j--) {
        newLog.push(`Instance ${newAlive[j]} gửi message OK đến Instance ${newAlive[i]}`);
      }
    }
    
    const newLeader = Math.max(...newAlive);
    setLeader(newLeader);
    
    newLog.push(`Instance ${newLeader} trở thành Leader mới`);
    
    for(let i = 0; i < newAlive.length; i++) {
      if(newAlive[i] !== newLeader) {
        newLog.push(`Instance ${newLeader} gửi message I won đến Instance ${newAlive[i]}`);
      }
    }
    
    newLog.push(`Kết thúc Election`);
    
    setLog(newLog);
  }
  
  const instances = Array.from({ length: numProcesses }).map((_, index) => index);
  
  const rows = chunkArray(instances, 10);
  
  return (
    <div style={{ padding: '16px' }}>
      <div style={{ marginBottom: '16px' }}>
        <InputNumber 
          defaultValue={0} 
          onChange={onChange} 
          min={0}
          max={100}
        />
        <span style={{ marginLeft: '8px' }}>Nhập số Instance</span>
      </div>
      
      {/* Flexbox container for side-by-side layout */}
      <div style={{ 
        display: 'flex', 
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        {/* Left side - Instances */}
        <div style={{ 

          flex: '1 1 60%', 
          minWidth: '300px',
          border: '1px solid #ddd', 
          padding: '16px', 
          borderRadius: '4px',
          backgroundColor: '#fafafa'
        }}>
          <h3 style={{ marginTop: 0 }}>Bully Algorithm </h3>
          {rows.map((row, rowIndex) => (
            <div 
              key={`row-${rowIndex}`} 
              style={{ 
                display: 'flex', 
                flexDirection: 'row', 
                flexWrap: 'wrap',
                marginBottom: '8px',
                justifyContent: 'center'
              }}
            >
              {row.map(index => (
                <Instace key={index} id={index + 1} leader={leader} startElection={startElection} crash={crash} recover={recover}/>
              ))}
            </div>
          ))}
          
          {numProcesses > 0 && (
            <div style={{ 
              marginTop: '20px', 
              padding: '10px', 
              borderTop: '1px dashed #ccc'
            }}>
              <div style={{ display: 'flex', gap: '20px' }}>
                <div>
                  <span style={{ 
                    display: 'inline-block', 
                    width: '12px', 
                    height: '12px', 
                    borderRadius: '50%', 
                    backgroundColor: '#1890ff', 
                    marginRight: '5px' 
                  }}></span>
                  Bình thường
                </div>
                <div>
                  <span style={{ 
                    display: 'inline-block', 
                    width: '12px', 
                    height: '12px', 
                    borderRadius: '50%', 
                    backgroundColor: '#d9d9d9', 
                    opacity: 0.5, 
                    marginRight: '5px' 
                  }}></span>
                  Bị crash
                </div>
                <div>
                  <span style={{ 
                    display: 'inline-block', 
                    width: '12px', 
                    height: '12px', 
                    borderRadius: '50%', 
                    backgroundColor: '#52c41a', 
                    marginRight: '5px' 
                  }}></span>
                  Leader
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Right side - Log */}
        <div style={{ 
          flex: '1 1 30%', 
          minWidth: '250px',
          border: '1px solid #ddd', 
          padding: '16px', 
          borderRadius: '4px',
          backgroundColor: '#f9f9f9',
          maxHeight: '500px',
          overflowY: 'auto'
        }}>
          <h3 style={{ marginTop: 0 }}>Log</h3>
          {log.length > 0 && numProcesses > 0 ? (
            <div>
              {log.map((item, index) => (
                <div 
                  key={index} 
                  style={{ 
                    padding: '8px', 
                    borderBottom: '1px solid #eee',
                    marginBottom: '8px'
                  }}
                >
                  {item}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ color: '#999', fontStyle: 'italic' }}>
              No logs available. Start by entering the number of Instance.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}