import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
    const [messages, setMessages] = useState([]);
    const [allFics, setAllFics] = useState([]);
    const [allWebs, setAllWebs] = useState([]);
    const ficAttributeTitles = ["title", "author", "fandom", "chapters", "words", "updated", "complete?"]
    const webAttributeTitles = ["title", "author", "genre", "episodes", "views", "updated", "complete?"]
    const [count, setCount] = useState(0);
    const [display, setDisplay] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCount(count + 1);
        }, 20000);

        fetch("api/fics")
            .then(res => res.json())
            .then(json => setAllFics(json.fics));
        fetch("api/webs")
            .then(res => res.json())
            .then(json => setAllWebs(json.webs));
        fetch("api/messages")
            .then(res => res.json())
            .then(json => setMessages(json.messages));
        return () => clearInterval(interval);
    }, [count]);

    const addItem = (event) => {
        event.preventDefault()
        const url = event.target.elements[0].value;
        event.target.elements[0].value = "";
        if(url.includes("archiveofourown.org/works/")) {
            fetch("api/fics", {
                method: "post",
                headers: {
                    "url": url,
                },
            })
                .then(res => res.json())
                .then(json => setAllFics(json.fics))
        } else if(url.includes("webtoons.com/en/")) {
            fetch("api/webs", {
                method: "post",
                headers: {
                    "url": url,
                },
            })
                .then(res => res.json())
                .then(json => setAllWebs(json.webs))
        } else {
            alert("invalid url")
        }
        
    }

    const changeDisplay = () => {
        setDisplay(display + 1);
    }

    const chooseDisplay = () => {
        if(display % 2 === 1) {
            return(
            <table className="messagetable">
            <colgroup>
                <col width="300px" />
                <col width="auto" />
                <col width="300px" />
            </colgroup>
            <tbody>
                <tr>
                    <td colSpan="4" id="titlename">add a fanfic/webtoon to track: 
                    <form onSubmit={addItem}>
                        <input className="inputbox"/>
                        <button type="submit" id="enterbutton">enter</button>
                    </form></td>
                </tr>
                <tr>
                    <td className="sidebar">
                        <button style={{position: "absolute", left:"10px", top:"10px", backgroundColor: "rgba(0,0,0,0)",borderStyle:"none", color:"#ffffff", fontFamily:"monospace"}} onClick={changeDisplay}>change</button>
                        <br/>fanfics on list<br/><br/>
                        {allFics.map((fic, j) => {return(<div className="contactsleft" key={j}><a href={fic[0]} className="urlbuttonleft" target="_blank" rel="noreferrer"><table cellSpacing="0"width="100%"><colgroup><col width="5px" /><col width="5px" /><col width="5px" /><col width="auto" /></colgroup><tbody>
                            {fic.slice(1).map((attribute,i) => {return(<tr key = {i}><td></td><td bgcolor="#9C1111"></td><td></td><td>{ficAttributeTitles[i]}: {attribute}</td></tr>)})}</tbody></table></a></div>)})}
                    </td>
                    <td className="bodydark">
                        <br/>updates<br/>
                        <table className="updatetable">
                            <tbody>
                                {messages.map((message,i) => {return(<tr key={i}><td className="updates" style={{borderColor:message.color}}><br/><a href={message.url} className="updateurldark" target="_blank" rel="noreferrer">&nbsp;&nbsp;{message.date} - <b>{message.wtitle}</b> - new chapter! #{message.num} {message.complete === "yes" ? "(COMPLETE)" : ""}</a></td></tr>)})}
                            </tbody>
                        </table>
                    </td>
                    <td className="sidebar">
                        <br/>webtoons on list<br/><br/>
                        {allWebs.map((web,j) => {return(<div key={j}className="contactsright"><a href={web[0]} className="urlbuttonright" target="_blank" rel="noreferrer"><table cellSpacing="0"width="100%"><colgroup><col width="auto" /><col width="5px" /><col width="5px" /><col width="5px" /></colgroup><tbody>
                            {web.slice(1).map((attribute,i) => {return(<tr key={i}><td>{webAttributeTitles[i]}: {attribute}</td><td></td><td bgcolor="#00d463"></td><td></td></tr>)})}</tbody></table></a></div>)})}
                    </td>
                </tr>
            </tbody>
        </table>)
        } else {
            return(<table className="messagetable">
            <colgroup>
                <col width="300px" />
                <col width="auto" />
                <col width="300px" />
            </colgroup>
            <tbody>
                <tr>
                    <td colSpan="4" style={{height:"80px"}}></td>
                </tr>
                <tr>
                    <td className="sidebarlight">
                        <button style={{position: "absolute", left:"10px", top:"10px", backgroundColor: "#FFFFFF",borderStyle:"none", fontFamily:"monospace"}} onClick={changeDisplay}>change</button>
                    </td>
                    <td className="body">
                        <br/>updates<br/>
                        <table className="updatetable">
                            <tbody>
                                {messages.map((message,i) => {return(<tr key={i}><td className="updates" style={{borderColor:message.color}}><br/><a href={message.url} className="updateurl" target="_blank" rel="noreferrer">&nbsp;&nbsp;{message.date} - <b>{message.wtitle}</b> - new chapter! #{message.num} {message.complete === "yes" ? "(COMPLETE)" : ""}</a></td></tr>)})}
                            </tbody>
                        </table>
                    </td>
                    <td className="sidebarlight">
                    </td>
                </tr>
            </tbody>
        </table>)
        }
    }



    return (
        chooseDisplay()
  )
}


export default App;