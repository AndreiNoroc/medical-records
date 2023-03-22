import React from 'react';
import ClientGetData from './ClientGetData';
import ClientGenerateKeys from './ClientGenerateKeys';

function ClientInterface() {
    return (
        <div>
            <h1>Client</h1>
            <div>
                <ClientGetData />
                <ClientGenerateKeys />
            </div>
        </div>
    );
};

export default ClientInterface;
