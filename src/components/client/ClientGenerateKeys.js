import React from 'react';
import { JSEncrypt } from "jsencrypt";

function ClientGenerateKeys() {
    const [isGenerated, setIsGenerated] = React.useState(false);
    const [privateKey, setPrivateKey] = React.useState('');
    const [publicKey, setPublicKey] = React.useState('');

    const handleClickStartGenerating = async () => {
        const crypt = new JSEncrypt({default_key_size: 2048});
        setPrivateKey(crypt.getPrivateKey());
        setPublicKey(crypt.getPublicKey());
        setIsGenerated(true);
    };

    return (
        <div>
            <button onClick={handleClickStartGenerating}> Start Generating Keys </button>
            {isGenerated ? <div>
                                <h3>Private key</h3>
                                <textarea readOnly>{privateKey}</textarea>
                                <h3>Public key</h3>
                                <textarea readOnly>{publicKey}</textarea>
                            </div> 
                            : <p>No keys</p>}
        </div>
    );
}

export default ClientGenerateKeys;
