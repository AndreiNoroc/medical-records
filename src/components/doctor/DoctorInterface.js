import React from 'react';
import DoctorGetData from './DoctorGet';
import DoctorInsert from './DoctorInsert';

function DoctorInterface() {
    const [flag, setActive] = React.useState(false);

    const handleClickInsertData = async () => {
        if (flag === false) {
            setActive(!flag);
        }
    };

    const handleClickGetData = async () => {
        if (flag === true) {
            setActive(!flag);
        }
    };

    return (
        <div>
            <h1 id='docHeader'>Doctor</h1>
            <div id='docChooseInterface'>
                <button onClick={handleClickInsertData}> Insert data </button>
                <button onClick={handleClickGetData}> Get data </button>
            </div>

            <div>
                {flag ? <DoctorInsert /> : <DoctorGetData />}
            </div>
        </div>
    );
}

export default DoctorInterface;