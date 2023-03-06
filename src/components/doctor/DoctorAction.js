import React from 'react';
import DoctorGetData from './DoctorGet';
import DoctorInterface from './DoctorInsert';

function DoctorAction() {
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
            <h1>Doctor</h1>
            <div>
                <div>
                    <button onClick={handleClickInsertData}> Insert data </button>
                </div>
                <div>
                    <button onClick={handleClickGetData}> Get data </button>
                </div>
            </div>

            <div>
                {flag ? <DoctorInterface /> : <DoctorGetData />}
            </div>
        </div>
    );
}

export default DoctorAction;