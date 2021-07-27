import React ,{useEffect,useState,useRef} from "react"
import './App.css';
import Dexie from 'dexie';
import {Table,Select,InputNumber} from 'antd';
import 'antd/dist/antd.css';

const { Option } = Select;

Dexie.delete('FriendDatabase');
function App() {
  const dbRef = useRef(new Dexie("FriendDatabase"))
  const total = 100
  const arr =  Array.from({length:total}, (v,k) =>{return {id:k,name: "Josephine"+k, age: k, sex: k%8===0?"man":"woman",key:k}})
  useEffect(()=>{
    let db = dbRef.current
    db.version(1).stores({ friends: "++id,name,age,sex" });
    setData(arr)

    db.transaction('rw', db.friends, async() => {

    if ((await db.friends.count()) === 0) {
        // Make sure we have something in DB:
          await db.friends.bulkAdd(arr);
    }
    }).catch(e => {
        // alert(e.stack || e);
    });
  },[])

  const columns = [
    {
      title: 'Id',
      dataIndex: 'id',
      key: 'id'
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: text => <a>{text}</a>,
    },
    {
      title: 'Age',
      dataIndex: 'age',
      key: 'age',
    },
    {
      title: 'Sex',
      dataIndex: 'sex',
      key: 'sex',
    }]
  const [data,setData]  = useState()
  const [count,setCount] = useState(0)
  const [num,setNum] = useState(0)
  const [optionVal,setOptionVal] = useState("age")
  const [sex,setSex] = useState("man")
  const [filterNum,setFilterNum] = useState()

  useEffect(()=>{
    getCount()
  },[filterNum,optionVal,sex])

  const getCount = async()=>{
    // Query:
    let youngFriends = []
    
    if(optionVal==="sex"){
      youngFriends = await dbRef.current.friends.where(optionVal).equals(sex).toArray();
    }else if(optionVal==="age"){
      if(!filterNum){
        return
      }
      youngFriends = await dbRef.current.friends.where(optionVal).above(filterNum).toArray();
    }
    console.log("youngFriends",youngFriends,optionVal,filterNum)
    setData(youngFriends)
    setCount(youngFriends.length)
  }
  return (
    <div className="App">
     <Table columns={columns} dataSource={data} />
     <Select style={{ width: 120 }} onChange={(value)=>setOptionVal(value)} defaultValue={optionVal}>
       {["age","sex"].map((option)=>{
         return  <Option value={option} key={option}>{option}</Option>
       })}
      </Select>
      {
      optionVal==="age" &&<>
      大于<InputNumber min={1} max={100} onChange={(value)=>{setNum(value)}} onPressEnter={()=>{setFilterNum(num)}}/>
      </>
      }
      {
        optionVal==="sex" &&
        <Select style={{ width: 120 }} onChange={(value)=>setSex(value)} defaultValue={sex} >
            {["woman","man"].map((option)=>{
              return  <Option value={option} key={option}>{option}</Option>
            })}
            </Select>
      }
      <div>总数：{count} <span style={{display:"inline-block",width:"20px"}}></span>占比：{(count / total).toFixed(2)}</div>
    </div>
  );
}

export default App;
