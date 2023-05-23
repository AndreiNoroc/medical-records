import "./Doctor.css";
import React from 'react';
import DoctorGetData from './DoctorGet';
import DoctorInsert from './DoctorInsert';

function DoctorInterface() {
    const [flag, setActive] = React.useState(false);
    const [insertColor, setInsertColor] = React.useState("");
    const [getColor, setGetColor] = React.useState("black solid 2px");

    const handleClickInsertData = async () => {
        if (flag === false) {
            setInsertColor("black solid 2px");
            setGetColor("none");
            setActive(!flag);
        }
    };

    const handleClickGetData = async () => {
        if (flag === true) {
            setGetColor("black solid 2px");
            setInsertColor("none");
            setActive(!flag);
        }
    };

    try {
        return (
            <div>
                <h1 id='docHeader'>Doctor</h1>
                <div id='docChooseInterface'>
                    <div>
                        <p>Choose action: </p>
                    </div>
                    <button style={{ outline: insertColor }} onClick={handleClickInsertData}> Insert data </button>
                    <button style={{ outline: getColor }} onClick={handleClickGetData}> Get data </button>
                </div>

                <div>
                    {flag ? <DoctorInsert /> : <DoctorGetData />}
                </div>
            </div>
        );
    } catch(error) {
        console.log(error);
        return null;
    }
}

export default DoctorInterface;