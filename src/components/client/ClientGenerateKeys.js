import React from 'react';
import { JSEncrypt } from "jsencrypt";
import { keysGenerated, isGenerated } from './ClientInterface'

let keys = {
    PublicKey: "",
    PrivateKey: ""
};

function ClientGenerateKeys() {
    const handleClickStartGenerating = async () => {
        const crypt = new JSEncrypt({default_key_size: 2048});
        keys.PrivateKey = crypt.getPrivateKey();
        keys.PublicKey = crypt.getPublicKey();
        isGenerated();
    };

    const style = {
        resize: 'none'
    }

    return (
        <div>
            {keysGenerated ? <div> <textarea readOnly style={style} defaultValue={keys.PublicKey}/> </div> : <button onClick={handleClickStartGenerating}> Start Generating Keys </button>}
        </div>
    );
}

export default ClientGenerateKeys;
